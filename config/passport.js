const db = require('../db');
const bcrypt = require('bcryptjs');
const LocalStrategy = require("passport-local").Strategy;

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'uEmail',   // email field from login form
    passwordField: 'uPass'     // password field from login form
  }, async (email, password, done) => {
    try {
      console.log("🔐 Login attempt:");
      console.log("Email entered:", email);

      const result = await db.query(`
        SELECT 
          uid AS "uId",
          uname AS "uName",
          uemail AS "uEmail",
          upass AS "uPass",
          unote AS "uNote",
          totalpl AS "totalPL",
          ptrade AS "pTrade",
          ltrade AS "lTrade"
        FROM ogusers
        WHERE uemail = $1
      `, [email]);

      const user = result.rows[0];

      if (!user) {
        console.log("❌ No user found with this email");
        return done(null, false, { message: 'Invalid email' });
      }

      console.log("✔️ User found. Hashed Password in DB:", user.uPass);
      console.log("Password entered:", password);

      const isValid = await bcrypt.compare(password, user.uPass); // ✅ Correct password comparison
      if (!isValid) {
        console.log("❌ Incorrect password");
        return done(null, false, { message: 'Incorrect password' });
      }

      console.log("✅ Password matched");
      return done(null, user);

    } catch (err) {
      console.log("❌ Error during authentication:", err);
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    console.log("🔄 Serializing user ID:", user.uId);
    done(null, user.uId); // store only user ID in session
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log("🔍 Deserializing user with ID:", id);
      const result = await db.query(`
        SELECT 
          uid AS "uId",
          uname AS "uName",
          uemail AS "uEmail",
          upass AS "uPass",
          unote AS "uNote",
          totalpl AS "totalPL",
          ptrade AS "pTrade",
          ltrade AS "lTrade"
        FROM ogusers
        WHERE uid = $1
      `, [id]);

      const user = result.rows[0];
      console.log("✅ Fetched user for session:", user);

      done(null, user);
    } catch (err) {
      console.log("❌ Error in deserialize:", err);
      done(err);
    }
  });
};
