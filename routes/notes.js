const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const {isLoggedIn} = require('../middleware.js');


// GET /users/:user_id/notes
router.get('/',isLoggedIn, wrapAsync(async (req, res) => {
    const userId = req.params.user_id;

    // Get user info from Ogusers
    const [[users]] = await db.query('SELECT * FROM Ogusers WHERE uId = ?', [userId]);
    if (users.length === 0) {
        return res.status(404).send("User not found");
    }
    //console.log([users]);
    // const username = users[0].username;
    // console.log(username);
    // Get user notes
    const [notes] = await db.query(
        'SELECT * FROM notes WHERE user_id = ? ORDER BY noteId DESC',
        [userId]
    );

    res.render("userTradenote.ejs", { notes, users, userId });
}));

// POST /users/:user_id/notes/add
router.post('/add',isLoggedIn, wrapAsync(async (req, res) => {
    const { title, content } = req.body;
    const userId = req.params.user_id;

    // Check if user exists
    const [users] = await db.query('SELECT * FROM Ogusers WHERE uId = ?', [userId]);
    if (users.length === 0) {
        return res.status(404).send("User not found");
    }

    if (!title && !content) return res.redirect(`/users/${userId}/notes`);

    await db.query(
        'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
        [userId, title || 'Untitled Note', content]
    );

    res.redirect(`/users/${userId}/notes`);
}));

// POST /users/:user_id/notes/delete/:id
router.post('/delete/:id',isLoggedIn, wrapAsync(async (req, res) => {
    const noteId = req.params.id;
    const userId = req.params.user_id;

    // Check if user exists
    const [users] = await db.query('SELECT * FROM Ogusers WHERE uId = ?', [userId]);
    if (users.length === 0) {
        return res.status(404).send("User not found");
    }

    await db.query(
        'DELETE FROM notes WHERE noteId = ? AND user_id = ?',
        [noteId, userId]
    );

    res.redirect(`/users/${userId}/notes`);
}));

module.exports = router;
