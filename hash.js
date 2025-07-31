// hash.js
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'test123';
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashed);
}

generateHash();