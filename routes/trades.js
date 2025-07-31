const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware.js');

// 🆕 Add this function here
const updateUserStats = async (userId) => {
  await db.query(`
    UPDATE ogusers
    SET 
      totalpl = (
        SELECT COALESCE(SUM((exprice - enprice) * qty), 0)
        FROM trades
        WHERE user_id = $1
      ),
      ptrade = (
        SELECT COUNT(*)
        FROM trades
        WHERE user_id = $1 AND (exprice - enprice) * qty > 0
      ),
      ltrade = (
        SELECT COUNT(*)
        FROM trades
        WHERE user_id = $1 AND (exprice - enprice) * qty < 0
      )
    WHERE uid = $1
  `, [userId]);
};

// GET all trades for user
router.get('/', isLoggedIn, wrapAsync(async (req, res) => {
  const userId = req.params.user_id;
  const resultUser = await db.query("SELECT * FROM ogusers WHERE uid = $1", [userId]);
  const user = resultUser.rows[0];
  if (!user) throw new ExpressError(404, "User not found");

  const resultTrades = await db.query("SELECT * FROM trades WHERE user_id = $1", [userId]);
  const trades = resultTrades.rows;
  res.render("userTradeinfo.ejs", { user, trades });
}));

// Form to add new trade
router.get('/new', isLoggedIn, wrapAsync(async (req, res) => {
  const resultUser = await db.query("SELECT * FROM ogusers WHERE uid = $1", [req.params.user_id]);
  const user = resultUser.rows[0];
  if (!user) throw new ExpressError(404, "User not found");
  res.render("newTrade.ejs", { user });
}));

// CREATE trade
router.post('/', isLoggedIn, wrapAsync(async (req, res) => {
  const { user_id } = req.params;
  let { date, stock, qty, direction, enTime, exTime, enPrice, exPrice, pro_los, enReason, exReason, stoploss, target, market, mistake, finalview } = req.body;

  if (!date || !stock || !qty || !direction || !enTime || !exTime || !enPrice || !exPrice)
    throw new ExpressError(400, "Missing required fields!");

  date = new Date(date).toISOString().split("T")[0];
  const isValidTime = t => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(t);
  if (!isValidTime(enTime) || !isValidTime(exTime)) {
    throw new ExpressError(400, "Invalid time format! Use HH:MM:SS");
  }

  await db.query(`
    INSERT INTO trades 
    (user_id, date, stock, qty, direction, entime, extime, enprice, exprice, pro_los, enreason, exreason, stoploss, target, market, mistake, finalview)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
  `, [user_id, date, stock, qty, direction, enTime, exTime, enPrice, exPrice, pro_los, enReason, exReason, stoploss, target, market, mistake, finalview]);

  await updateUserStats(user_id);
  req.flash("success", "New trade added!!");
  res.redirect(`/users/${user_id}/trades`);
}));

// Edit trade form
router.get('/:tradeid', isLoggedIn, wrapAsync(async (req, res) => {
  const resultUser = await db.query("SELECT * FROM ogusers WHERE uid = $1", [req.params.user_id]);
  const user = resultUser.rows[0];

  const resultTrade = await db.query("SELECT * FROM trades WHERE tradeid = $1", [req.params.tradeid]);
  const trade = resultTrade.rows[0];

  if (!user || !trade) throw new ExpressError(404, "User or Trade not found");
  res.render("editTradeinfo.ejs", { user, trade });
}));

// UPDATE trade
router.put('/:tradeid', isLoggedIn, wrapAsync(async (req, res) => {
  const { user_id, tradeid } = req.params;
  let { date, stock, qty, direction, enTime, exTime, enPrice, exPrice, pro_los, enReason, exReason, stoploss, target, market, mistake, finalview } = req.body;

  date = new Date(date).toISOString().split("T")[0];
  const isValidTime = t => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(t);
  if (!isValidTime(enTime) || !isValidTime(exTime)) {
    throw new ExpressError(400, "Invalid time format");
  }

  const result = await db.query(`
    UPDATE trades SET 
    date=$1, stock=$2, qty=$3, direction=$4, entime=$5, extime=$6, enprice=$7, exprice=$8, pro_los=$9, 
    enreason=$10, exreason=$11, stoploss=$12, target=$13, market=$14, mistake=$15, finalview=$16
    WHERE tradeid=$17 AND user_id=$18
  `, [date, stock, qty, direction, enTime, exTime, enPrice, exPrice, pro_los, enReason, exReason, stoploss, target, market, mistake, finalview, tradeid, user_id]);

  if (result.rowCount === 0) throw new ExpressError(404, "Trade not found");
  await updateUserStats(user_id);
  req.flash("success", "Trade edited successfully!!");
  res.redirect(`/users/${user_id}/trades`);
}));

// DELETE trade
router.delete('/:tradeid', isLoggedIn, wrapAsync(async (req, res) => {
  const { user_id, tradeid } = req.params;
  const result = await db.query('DELETE FROM trades WHERE tradeid = $1 AND user_id = $2', [tradeid, user_id]);
  if (result.rowCount === 0) throw new ExpressError(404, "Trade not found");
  await updateUserStats(user_id);
  req.flash("success", "Trade deleted!!");
  res.redirect(`/users/${user_id}/trades`);
}));

module.exports = router;
