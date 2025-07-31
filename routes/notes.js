const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware.js');

// GET /users/:user_id/notes
router.get('/', isLoggedIn, wrapAsync(async (req, res) => {
    const userId = req.params.user_id;

    // Get user info from Ogusers
    const resultUser = await db.query('SELECT * FROM Ogusers WHERE uId = $1', [userId]);
    const user = resultUser.rows[0]; // Fix: use single user object
    if (!user) {
        throw new ExpressError(404, "User not found");
    }

    // Get user notes
    const resultNotes = await db.query(
        'SELECT * FROM notes WHERE user_id = $1 ORDER BY noteId DESC',
        [userId]
    );
    const notes = resultNotes.rows;

    res.render("note.ejs", { notes, user, userId }); // pass user not users
}));

// POST /users/:user_id/notes/add
router.post('/add', isLoggedIn, wrapAsync(async (req, res) => {
    const { title, content } = req.body;
    const userId = req.params.user_id;

    const resultUser = await db.query('SELECT * FROM Ogusers WHERE uId = $1', [userId]);
    const user = resultUser.rows[0];
    if (!user) {
        throw new ExpressError(404, "User not found");
    }

    if (!title && !content) {
        req.flash("error", "Note cannot be empty.");
        return res.redirect(`/users/${userId}/notes`);
    }

    await db.query(
        'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3)',
        [userId, title || 'Untitled Note', content]
    );

    req.flash("success", "Note added!");
    res.redirect(`/users/${userId}/notes`);
}));

// POST /users/:user_id/notes/delete/:id
router.post('/delete/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const noteId = req.params.id;
    const userId = req.params.user_id;

    const resultUser = await db.query('SELECT * FROM Ogusers WHERE uId = $1', [userId]);
    const user = resultUser.rows[0];
    if (!user) {
        throw new ExpressError(404, "User not found");
    }

    await db.query(
        'DELETE FROM notes WHERE noteId = $1 AND user_id = $2',
        [noteId, userId]
    );

    req.flash("success", "Note deleted!");
    res.redirect(`/users/${userId}/notes`);
}));

module.exports = router;
