const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TaxRecord = require('../models/TaxRecord');

// POST /api/ai/chat
router.post('/chat', auth, async (req, res) => {
    const { message, taxContext } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const systemPrompt = `You are a friendly Indian tax assistant. You help salaried Indians understand their tax in simple language. Always use Indian number formatting (lakhs, crores). Always reference specific sections like 80C, 80D, 87A by name. Never give advice that contradicts Indian Income Tax Act 2024. The user's current tax data is injected below. Keep answers under 150 words unless the user asks to elaborate. Answer only tax-related questions.\n\nUser Tax Context:\n${JSON.stringify(taxContext)}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY1}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: message }] }],
                generationConfig: { maxOutputTokens: 400 }
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Gemini API Error:', errBody);
            return res.status(503).json({ error: 'AI service temporarily unavailable' });
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";

        res.json({ reply });
    } catch (err) {
        console.error('Error in /api/ai/chat:', err);
        res.status(503).json({ error: 'AI service temporarily unavailable' });
    }
});

// POST /api/ai/summary
router.post('/summary', auth, async (req, res) => {
    try {
        const record = await TaxRecord.findOne({ user: req.user.id }).sort({ year: -1 });

        if (!record) {
            return res.status(404).json({ error: 'No tax records found for user.' });
        }

        const promptStr = `Generate a 3-sentence plain-English tax summary for an Indian salaried taxpayer. Format: Sentence 1: their income and effective tax rate. Sentence 2: their biggest tax-saving opportunity this year. Sentence 3: the recommended regime and why. Data: ${JSON.stringify(record)}. Use ₹ symbol. Use lakh/crore notation.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY1}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: promptStr }] }],
                generationConfig: { maxOutputTokens: 400 }
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Gemini API Error:', errBody);
            return res.status(503).json({ error: 'AI service temporarily unavailable' });
        }

        const data = await response.json();
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";

        res.json({ summary });

    } catch (err) {
        console.error('Error in /api/ai/summary:', err);
        res.status(503).json({ error: 'AI service temporarily unavailable' });
    }
});

module.exports = router;
