const { OpenAI } = require('openai');
const axios = require('axios');

const getOpenAIClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        console.error("❌ Error: OPENAI_API_KEY is missing in .env");
        return null;
    }
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

exports.generateMoodSticker = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, error: "No text provided" });
        }

        const openai = getOpenAIClient();
        if (!openai) {
            return res.status(500).json({ success: false, error: "AI Service Configuration Error" });
        }

        // 1. ניתוח הטקסט בעזרת GPT - כאן נכנס הפרומפט שלך
        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a sticker expert for a social cool app for young. 
                    Your goal: Find a reaction that clearly expresses the user's current mood or emotional reaction un untersting ways. 
                    Prioritize emotions, expressive gestures, and clear non-verbal cool interesting reactions.
                    
                    Rules:
                    1. For 'search_term': Return a precise English search term for an animated GIPHY sticker (e.g., "excited dance", "facepalm", "celebration cat").
                    2. For 'emoji': Return one single matching emoji.
                    
                    Return ONLY a JSON object:
                    { "search_term": "string", "emoji": "string" }`
                },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" }
        });

        const { search_term, emoji } = JSON.parse(gptResponse.choices[0].message.content);
        console.log(`🤖 AI Selected: ${search_term} ${emoji}`); // לוג לביקורת

        // 2. חיפוש מדבקה ב-Giphy עם מילת החיפוש שה-AI יצר
        const GIPHY_API_KEY = process.env.GIPHY_API_KEY; 
        const giphyRes = await axios.get(`https://api.giphy.com/v1/stickers/search`, {
            params: {
                api_key: GIPHY_API_KEY,
                q: search_term, // המילה המזוקקת מה-AI
                limit: 1,
                rating: 'g'
            }
        });

        const stickerUrl = giphyRes.data.data[0]?.images?.fixed_height?.url || null;

        res.json({
            success: true,
            emoji: emoji,
            stickerUrl: stickerUrl 
        });

    } catch (error) {
        console.error("❌ AI Agent Error:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

exports.generateFromEmoji = async (req, res) => {
    res.json({ success: true, message: "Emoji processing route ready" });
};