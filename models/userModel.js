// models/User.js
const db = require("../db");
const bcrypt = require("bcryptjs");

// Find user by email (used in login)
const findUserByEmail = async (uEmail) => {
  const result = await db.query("SELECT * FROM Ogusers WHERE uEmail = $1", [uEmail]);
  return result.rows[0];
};

// Find user by ID (used in session)
const findUserById = async (uId) => {
  const result = await db.query("SELECT * FROM Ogusers WHERE uId = $1", [uId]);
  return result.rows[0];
};

// Create a new user with hashed password (used in signup)
const createUser = async (uName, uEmail, uPass) => {
  const hashedPassword = await bcrypt.hash(uPass, 10);
  await db.query(
    "INSERT INTO Ogusers (uName, uEmail, uPass) VALUES ($1, $2, $3)",
    [uName, uEmail, hashedPassword]
  );
};

// Validate password during login
const validatePassword = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  validatePassword,
};
