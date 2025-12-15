// Real AI Service - powered by OpenAI
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const optimizeText = async (text, context = 'general', jobDescription = '') => {
    if (!text || text.trim().length === 0) return text;
    if (!API_KEY || API_KEY.includes('paste_your_key')) {
        console.warn("Missing OpenAI API Key");
        return text + " [AI Mode: Key Missing]";
    }

    try {
        const systemPrompt = `You are an expert Resume Writer and Career Coach. 
        Your task is to rewrite the user's input text to be more professional, impactful, and ATS-friendly.
        ${jobDescription ? `Optimize strictly for this Job Description: ${jobDescription.substring(0, 500)}...` : ''}
        Use strong action verbs. Quantify results where possible. Keep it concise.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Rewrite this ${context}:\n${text}` }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("AI Request Failed:", error);
        return text; // Fallback to original
    }
};

export const generateSummary = async (data, jobDescription = '') => {
    if (!API_KEY || API_KEY.includes('paste_your_key')) return "AI Summary requires API Key in .env file.";

    const prompt = `Write a professional resume summary for:
    Name: ${data.personal.fullName}
    Title: ${data.personal.title}
    Skills: ${data.skills}
    Experience Count: ${data.experience.length} roles.
    ${jobDescription ? `Tailor it for this Job: ${jobDescription.substring(0, 500)}...` : ''}
    Keep it under 50 words. First person. Strong opening.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });
        const resData = await response.json();
        return resData.choices[0].message.content.trim();
    } catch (e) {
        return "Failed to generate summary.";
    }
};
