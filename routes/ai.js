const express = require("express");
const db = require("../db");
const { getAISuggestions } = require("../utils/aiUtils");
const { isLoggedIn } = require('../middleware.js');
const router = express.Router({ mergeParams: true });
const fetch = require("node-fetch");

router.get("/insights", isLoggedIn, async (req, res) => {
  const userId = req.params.user_id; // Use session for logged-in user

  try {
    const [trades] = await db.query(`SELECT * FROM trades WHERE user_id = ?`, [userId]);


    console.log("User ID:", userId);
    console.log("Trades:", trades);
    // console.log("Stats:", stats);

    const aiText = await getAISuggestions(trades);
    // res.json({ success: true, insights: aiText });
    res.render("aiInsights.ejs", { insights: aiText, userId })

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "AI service error. Try again later." });
  }
});

module.exports = router;