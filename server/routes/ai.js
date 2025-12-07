const express = require('express');
const router = express.Router();
const openai = require('../config/openai');

// Optimize content endpoint
router.post('/optimize', async (req, res) => {
    const { section, content, jobDescription } = req.body;

    try {
        const prompt = `
      You are an expert CV writer and ATS optimization specialist.
      Task: Optimize the following "${section}" content for a resume.
      Target Job Description: ${jobDescription || "General professional role"}
      
      Original Content:
      "${content}"

      Requirements:
      1. Improve clarity, impact, and professionalism.
      2. Use strong action verbs.
      3. Incorporate relevant keywords from the job description if provided.
      4. Ensure ATS readability.
      5. Return ONLY the optimized text.
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
            model: "gpt-4o-mini", // Using mini as requested (mapped to available model)
        });

        res.json({ optimizedContent: completion.choices[0].message.content.trim() });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'Failed to optimize content' });
    }
});
// Analyze photo endpoint
router.post('/analyze-photo', async (req, res) => {
    const { imageBase64 } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional career coach analyzing resume profile photos. Analyze the image for professionalism, lighting, background, and attire. Return a JSON object with: 1. 'score' (0-100), 2. 'status' (Green, Yellow, Red), 3. 'feedback' (concise string)."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this profile photo for a professional resume." },
                        { type: "image_url", image_url: { url: imageBase64 } }
                    ],
                },
            ],
            max_tokens: 300,
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        res.json(analysis);
    } catch (error) {
        console.error('AI Photo Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze photo' });
    }
});

// ATS Score Endpoint
router.post('/ats-score', async (req, res) => {
    const { resumeText, jobDescription } = req.body;
    try {
        const prompt = `
                You are an ATS (Applicant Tracking System) expert. 
                Evaluate the following resume against the job description.
                
                Job Description: "${jobDescription || 'General Professional Role'}"
                Resume Content: "${resumeText.substring(0, 3000)}"

                Return a JSON object with:
                1. score (0-100)
                2. feedback (concise bullet points on what is missing or good)
                3. missingKeywords (array of strings)
             `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a stricter ATS scanner. Output valid JSON only." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(response.choices[0].message.content);
        res.json(data);
    } catch (error) {
        console.error('ATS Error:', error);
        res.status(500).json({ error: 'Failed to calculate ATS score' });
    }
});

module.exports = router;
