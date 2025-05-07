const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'uEmail', passwordField: 'uPass' },
      async (email, password, done) => {
        try {
          const user = await User.findUserByEmail(email);
          if (!user) return done(null, false, { message: 'Email not registered' });

          const match = await bcrypt.compare(password, user.uPass);
          if (!match) return done(null, false, { message: 'Incorrect password' });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.uId));

  passport.deserializeUser(async (id, done) => {
    try {
      console.log("Deserializing User with ID:", id);  // << Add this
      const user = await User.findUserById(id);
      console.log("User found:", user); // << Add this
  
      done(null, user);
    } catch (err) {
      console.log("Error in deserialize:", err); // << Add this
      done(err);
    }
  });
  
};