// Real AI Service - powered by OpenAI

const getApiKey = () => {
    return localStorage.getItem('openai_api_key') || '';
};

export const saveApiKey = (key) => {
    localStorage.setItem('openai_api_key', key);
};

export const hasApiKey = () => {
    return !!getApiKey();
};

export const optimizeText = async (text, context = 'general', jobDescription = '') => {
    if (!text || text.trim().length === 0) return text;

    const API_KEY = getApiKey();
    if (!API_KEY) {
        console.warn("Missing OpenAI API Key");
        throw new Error("MISSING_API_KEY");
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
    const API_KEY = getApiKey();
    if (!API_KEY) return "Professional summary generated based on your experience and skills.";

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
