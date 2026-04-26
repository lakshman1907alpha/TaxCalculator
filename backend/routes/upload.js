const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const auth = require('../middleware/auth');

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Handle Multer specifically strictly for /parse route catching limit errors natively
router.post('/parse', auth, (req, res, next) => {
    upload.single('document')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No valid document uploaded' });
    }

    try {
        const base64Data = req.file.buffer.toString('base64');
        const systemPrompt = "You are a tax document parser for Indian income tax documents. Extract ONLY the following fields if present: grossSalary, basicSalary, hra, specialAllowance, professionalTax, epfEmployee, tdsDeducted, grossTotalIncome, deductions80C, deductions80D, netTaxableIncome. Return ONLY a valid JSON object with these exact keys. Use numeric values in rupees (no commas, no symbols). If a field is not found, omit it from the JSON. Do not return any explanation, only the JSON object.";

        const userParts = [
            { text: "Extract the exact requested tax details from this document." },
            { inlineData: { mimeType: req.file.mimetype, data: base64Data } }
        ];

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY2}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: userParts }],
                generationConfig: {
                    maxOutputTokens: 4000,
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Gemini API Error:', errBody);
            throw new Error(`Gemini API Error: ${errBody}`);
        }

        const aiData = await response.json();
        let replyText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

        // Strip markdown backticks just in case, though responseMimeType usually prevents them
        replyText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();

        let extractedData;
        try {
            extractedData = JSON.parse(replyText);
        } catch (parseError) {
            throw new Error(`JSON Parse Error. Raw model output: ${replyText}`);
        }

        const keysFound = Object.keys(extractedData).length;
        let confidence = 'low';

        if (keysFound > 6) confidence = 'high';
        else if (keysFound >= 3) confidence = 'medium';

        res.json({ extractedData, confidence });
    } catch (err) {
        console.error('Document Parsing Error:', err);
        return res.status(422).json({ error: `Upload Extraction Failed: ${err.message}` });
    }
});

module.exports = router;
