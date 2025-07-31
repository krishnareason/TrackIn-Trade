// Configure the connection
//MAIN
const mysql = require('mysql2/promise');

// Configure the pool (recommended)
// const pool = mysql.createPool({
//     host: 'tramway.proxy.rlwy.net',
//     user: 'root',
//     password: 'BtXrxurgqqjyQLPaxFxQZywpBNNYPBTf',
//     database: 'railway',
//     port: 19753,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });
// module.exports = pool;

// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_LdqUi35lcuXJ@ep-bitter-glitter-adtl8uof-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});
module.exports = pool;
