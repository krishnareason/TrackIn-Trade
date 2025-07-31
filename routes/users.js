const express = require('express');
const router = express.Router();
const db = require('../db');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware.js');

// GET all users
router.get('/', wrapAsync(async (req, res) => {
    const result = await db.query('SELECT * FROM Ogusers');
    const users = result.rows;
    res.json(users);
}));

router.get('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const userId = req.params.id;

    // Step 1: Check user exists
    const resultUser = await db.query('SELECT * FROM Ogusers WHERE uId = $1', [userId]);
    const user = resultUser.rows[0];

    if (!user) {
        req.flash("error", "User doesn't exist!!");
        return res.redirect("/home");
    }

    // Step 2: Get user's trades
    const resultTrades = await db.query('SELECT * FROM trades WHERE user_id = $1', [userId]);
    const trades = resultTrades.rows;

    // Step 3: Calculate total P&L, profit count, and loss count
    const resultStats = await db.query(`
        SELECT 
            COALESCE(SUM(pro_los), 0) AS totalPL,
            COUNT(CASE WHEN pro_los > 0 THEN 1 END) AS pTrade,
            COUNT(CASE WHEN pro_los < 0 THEN 1 END) AS lTrade
        FROM trades
        WHERE user_id = $1
    `, [userId]);
    const stats = resultStats.rows[0];

    // Step 4: Attach stats to user
    user.totalPL = stats.totalPL;
    user.pTrade = stats.pTrade;
    user.lTrade = stats.lTrade;

    // Final step: Render dashboard
    res.render("userDash.ejs", { user, trades });
}));

// CREATE user
router.post('/', isLoggedIn, wrapAsync(async (req, res) => {
    const { uName, uEmail, uPass, uNote, totalPL, pTrade, lTrade } = req.body;
    const result = await db.query(
        'INSERT INTO Ogusers (uName, uEmail, uPass, uNote, totalPL, pTrade, lTrade) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING uId',
        [uName, uEmail, uPass, uNote, totalPL, pTrade, lTrade]
    );
    const insertedId = result.rows[0].uId;
    res.json({ id: insertedId, uName, uEmail, uPass, uNote, totalPL, pTrade, lTrade });
}));

// UPDATE user
router.put('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const userId = req.params.id;
    const { uName, uEmail, uPass, uNote, totalPL, pTrade, lTrade } = req.body;
    await db.query(
        'UPDATE Ogusers SET uName=$1, uEmail=$2, uPass=$3, uNote=$4, totalPL=$5, pTrade=$6, lTrade=$7 WHERE uId=$8',
        [uName, uEmail, uPass, uNote, totalPL, pTrade, lTrade, userId]
    );
    res.json({ message: "User updated successfully" });
}));

// DELETE user and trades
router.delete('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const userId = req.params.id;
    await db.query("DELETE FROM trades WHERE user_id = $1", [userId]);
    await db.query("DELETE FROM Ogusers WHERE uId = $1", [userId]);
    res.json({ message: "User and trades deleted" });
}));

module.exports = router;
