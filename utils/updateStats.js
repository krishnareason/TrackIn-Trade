const db = require('../db');

async function updateUserStats(userId) {
  await db.query(`
    UPDATE ogusers
    SET totalpl = (
      SELECT COALESCE(SUM((exprice - enprice) * qty), 0)
      FROM trades
      WHERE user_id = $1
    ),
    ptrade = (
      SELECT COUNT(*)
      FROM trades
      WHERE user_id = $1 AND (exprice - enprice) * qty > 0
    ),
    ltrade = (
      SELECT COUNT(*)
      FROM trades
      WHERE user_id = $1 AND (exprice - enprice) * qty < 0
    )
    WHERE uid = $1
  `, [userId]);
}

module.exports = updateUserStats;
