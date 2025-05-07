const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/userModel");

// Middleware to protect routes
const isLoggedIn = (req, res, next) => {
    // if (req.isAuthenticated()) return next();
    // req.flash("error", "You must be logged in first!");
    // res.redirect("/login");
    next();
};

// Signup Form
router.get("/signup", (req, res) => {
    res.render("signup");
});

// Signup Logic
router.post("/signup", async (req, res) => {
    const { uName, uEmail, uPass } = req.body;
    try {
        await User.createUser(uName, uEmail, uPass);
        req.flash("success", "Account created successfully. Please log in!");
        res.redirect("/login");
    } catch (err) {
        req.flash("error", "Error creating account: " + err.message);
        res.redirect("/signup");
    }
});

// Login Form
router.get("/login", (req, res) => {
    res.render("login");
});

// Login Logic
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(`/users/${req.user.uId}`);
});

// Logout
router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged you out!");
        res.redirect("/home");
    });
});

module.exports = { router, isLoggedIn };
