require("dotenv").config();
const fetch = require("node-fetch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://openrouter.ai/api/v1/chat/completions";

const getAISuggestions = async (trades) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
        return "Invalid input: No trades or user statistics provided.";
    }

    const userPrompt = `
User Trades:
\`\`\`
${trades.map((t, i) => `Trade ${i + 1}:
Stock: ${t.stock}
Direction: ${t.direction}
Qty: ${t.qty}
Entry: ${t.enPrice} at ${t.enTime}
Exit: ${t.exPrice} at ${t.exTime}
P&L: ${t.pro_los}
Reason: ${t.enReason} / ${t.exReason}
Mistake: ${t.mistake}
Final View: ${t.finalview}
`).join("\n")}
\`\`\`

Please answer with:
1. General performance feedback
2. Mistake pattern or psychological issues
3. Time estimation to become profitable if trend continues
4. Suggestions for improvement
`;

    try {
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GEMINI_API_KEY}`,
                "Content-Type": "application/json",
                "Referer": "http://localhost:3000",
                "X-Title": "TrackInTrade"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o",
                max_tokens: 400,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert trading coach. Analyze user trading history and provide professional feedback."
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ]
            })
        });

        const result = await response.json();
        //console.log("AI API Response:", JSON.stringify(result, null, 2)); // Debug line

        return result?.choices?.[0]?.message?.content
            .replace(/\*\*(.*?)\*\*/g, '$1') || "No response from AI.";

    } catch (error) {
        console.error("AI request failed:", error);
        return "Failed to get AI suggestions.";
    }
};

module.exports = { getAISuggestions };
