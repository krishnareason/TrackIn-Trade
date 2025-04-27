const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/userModel");
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');

// Middleware to protect routes
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

// Signup Form
router.get("/signup", (req, res) => {
  res.render("signup");
});

// Signup Logic
router.post("/signup", wrapAsync(async (req, res) => {
  const { uName, uEmail, uPass } = req.body;
  try {
    await User.createUser(uName, uEmail, uPass);
    req.flash("success","Account is Created, Please login");
    res.redirect("/login");
  } catch (err) {
    req.flash("error", "Error creating user ");
    res.redirect("/signup");
  }
}));

// Login Form
router.get("/login", (req, res) => {
  res.render("login");
});


router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", info.message);
      return res.redirect("/login");
    }

    // Log in user
    req.logIn(user, (err) => {
      if (err) return next(err);

      // ✅ Redirect to their dashboard with user ID
      return res.redirect(`/users/${user.uId}`);
    });
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/home");
  });
});

module.exports = { router, isLoggedIn };
