require("dotenv").config();

const express = require('express');
const app = express();
require('express-async-errors');
const path = require('path');
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const db = require('./db');
const ExpressError = require("./utils/ExpressError.js");
const middleware = require('./middleware');

// Routes
const userRoutes = require('./routes/users');
const tradeRoutes = require('./routes/trades');
const notesRouter = require('./routes/notes');
const aiRoutes = require("./routes/ai");
const { router: authRoutes, isLoggedIn } = require("./routes/auth");

// Passport config
require("./config/passport")(passport);

// View engine
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Session & Flash
const sessionOptions = {
    secret: process.env.SESSION_SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: false,  // more secure
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionOptions));
app.use(flash());

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
app.use(middleware.setCurrentUser);

// Flash & Current User Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user || null;
    next();
});

// Routes
app.get("/", (req, res) => res.redirect("/home"));
app.get("/home", (req, res) => res.render("frontpage"));
app.get("/documentation", (req, res) => res.render("documentation"));

app.use("/", authRoutes);
app.use('/users', isLoggedIn, userRoutes);
app.use('/users/:user_id/trades', isLoggedIn, tradeRoutes);
app.use('/users/:user_id/notes', isLoggedIn, notesRouter);
app.use('/users/:user_id/ai', isLoggedIn, aiRoutes);

app.get('/dashboard', isLoggedIn, (req, res) => {
    res.render('userDash', { user: req.user });
});

// 404 Handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error", { errorMsg: message, stack: err.stack });
});

// Start Server
app.listen(3000, () => {
    console.log("✅ Server is running at http://localhost:3000");
});
