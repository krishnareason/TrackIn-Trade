// app.js or index.js
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
const LocalStrategy = require("passport-local");
const db = require('./db');
const bcrypt = require("bcryptjs");
const ExpressError = require("./utils/ExpressError.js");
const middleware = require('./middleware');
const User = require("./models/userModel.js");

// Route files
const userRoutes = require('./routes/users');
const tradeRoutes = require('./routes/trades');
const notesRouter = require('./routes/notes');
const aiRoutes = require("./routes/ai");
const { router: authRoutes, isLoggedIn } = require("./routes/auth");



// Passport config
require("./config/passport")(passport);


// View engine and Middleware
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


// Session & Flash config (use environment variable for secret in production)
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};
app.use(session(sessionOptions));
app.use(flash());

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(middleware.setCurrentUser);

// Flash & user data middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user || null;
    next();
});

app.get("/register", (req,res)=>{
    let { name } = req.query;
    res.send(name);
    // res.session.name = name;
    // res.redirect("/hello");
});

app.get("/hello",(req,res) =>{
    res.send(`hello, ${req.session.name}`);
});

// Routes
app.get("/", (req, res) => res.redirect("/home"));
app.get("/home", (req, res) => res.render("frontpage.ejs"));
app.get("/documentation", (req, res) => res.render("documentation.ejs"));
// app.get("/aiInsights", (req, res) => res.redirect("aiInsights.ejs"));



app.use("/", authRoutes);
app.use('/users', userRoutes);
app.use('/users/:user_id/trades', tradeRoutes);
app.use('/users/:user_id/notes', notesRouter);
app.use('/users/:user_id/ai', aiRoutes);

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
    res.status(statusCode).render("error.ejs", { errorMsg: message, stack: err.stack });
});

// Start Server
app.listen(3000, () => {
    console.log("✅ Server is running on http://localhost:3000");
});
