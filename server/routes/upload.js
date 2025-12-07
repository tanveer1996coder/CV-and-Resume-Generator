const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const openai = require('../config/openai');

router.post('/analyze', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        const resumeText = data.text;

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Analyze with AI
        const prompt = `
            You are a strict Professional Resume Auditor. Analyze the following resume text.
            
            Resume Text:
            "${resumeText.substring(0, 4000)}"

            Return a valid JSON object with the following keys:
            1. "credibility": number (0-100) - based on detail, formatting implication, and professional language.
            2. "atsScore": number (0-100) - based on keyword richness and structure.
            3. "loopholes": array of strings - listing critical missing info or red flags (e.g., "Missing contact info", "Unexplained chronological gaps", "Generic objective").
            4. "improvements": array of strings - actionable tips to fix the loopholes or enhance impact.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a professional resume auditor. Return strictly JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        res.json({
            text: resumeText,
            analysis: analysis
        });

    } catch (error) {
        console.error('Error analyzing PDF:', error);
        res.status(500).send('Error analyzing PDF');
    }
});

module.exports = router;
