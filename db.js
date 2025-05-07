// Configure the connection
//MAIN
const mysql = require('mysql2/promise');

// Configure the pool (recommended)
const pool = mysql.createPool({
    host: 'tramway.proxy.rlwy.net',
    user: 'root',
    password: 'BtXrxurgqqjyQLPaxFxQZywpBNNYPBTf',
    database: 'railway',
    port: 19753,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
module.exports = pool;

