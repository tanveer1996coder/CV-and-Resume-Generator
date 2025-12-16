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
        throw new Error("MISSING_API_KEY");
    }

    try {
        const systemPrompt = `You are an expert Resume Writer and Career Coach. 
        Your task is to rewrite the user's input text to be more professional, impactful, and ATS-friendly.
        ${jobDescription ? `Optimize strictly for this Job Description: ${jobDescription.substring(0, 500)}...` : ''}
        Use strong action verbs. Quantify results where possible. Keep it concise. Do NOT invent experiences not present in the source text.`;

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
    if (!API_KEY) throw new Error("MISSING_API_KEY");

    const prompt = `Write a professional resume summary for:
    Name: ${data.personal.fullName}
    Title: ${data.personal.title}
    Skills: ${data.skills}
    Experience Count: ${data.experience.length} roles.
    ${jobDescription ? `Tailor it specifically for this Job Description: ${jobDescription.substring(0, 500)}...` : ''}
    Keep it strictly under 50 words. First person. Strong opening. Do NOT use placeholders.`;

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
        throw new Error("SUMMARY_GEN_FAILED");
    }
};

// --- NEW FEATURES ---

export const parseDocumentWithAI = async (text, type = 'resume') => {
    const API_KEY = getApiKey();
    if (!API_KEY) throw new Error("MISSING_API_KEY");

    const systemPrompt = `You are an expert ${type} parser. Extract data from the provided text into JSON format.
    Schema for Resume/CV:
    {
        "personal": { "fullName": "", "email": "", "phone": "", "title": "", "summary": "", "address": "" },
        "experience": [{ "role": "", "company": "", "start": "", "end": "", "description": "" }],
        "education": [{ "school": "", "degree": "", "field": "", "year": "" }],
        "skills": "comma separated string",
        "awards": [{ "name": "", "date": "" }],
        "publications": [{ "title": "", "journal": "", "year": "" }]
    }
    IMPORTANT:
    - Extract EXACTLY what is in the text.
    - Do NOT invent or hallucinate data to fill fields.
    - If a field is missing, leave it as an empty string.
    - Do NOT use "John Doe" or placeholders.
    Return ONLY valid JSON. No markdown formatting.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-16k", // Use 16k context for large PDF texts
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Extract real data from this text:\n\n${text.substring(0, 15000)}` }
                ],
                temperature: 0, // Deterministic for extraction
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("AI Parsing Failed:", error);
        throw new Error("AI_PARSE_FAILED");
    }
};

export const analyzeGap = async (resumeData, jobDescription) => {
    const API_KEY = getApiKey();
    if (!API_KEY) throw new Error("MISSING_API_KEY");

    const prompt = `Analyze this resume against the job description.
    Resume Skills: ${resumeData.skills}
    Resume Experience: ${JSON.stringify(resumeData.experience.map(e => e.role))}
    Job Description: ${jobDescription.substring(0, 1000)}

    Provide a JSON response with:
    {
        "score": number (0-100),
        "missingSkills": ["skill1", "skill2"],
        "suggestions": ["actionable advice 1", "actionable advice 2"]
    }
    Return ONLY valid JSON.`;

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
                temperature: 0.5,
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error("Gap Analysis Failed:", error);
        return null;
    }
};

export const generateCoverLetter = async (resumeData, jobDescription) => {
    const API_KEY = getApiKey();
    if (!API_KEY) throw new Error("MISSING_API_KEY");

    const prompt = `Write a professional cover letter.
    Candidate: ${resumeData.personal.fullName}
    Skills: ${resumeData.skills}
    Experience: ${JSON.stringify(resumeData.experience.slice(0, 2))}
    Target Job: ${jobDescription.substring(0, 500)}

    Return JSON:
    {
        "subject": "Subject line",
        "greeting": "Dear Hiring Manager,",
        "body": "The main content paragraphs...",
        "closing": "Sincerely,"
    }`;

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
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error("Cover Letter Gen Failed:", error);
        throw new Error("CL_GEN_FAILED");
    }
};

export const enhanceContent = async (text, type = 'general') => {
    const API_KEY = getApiKey();
    if (!API_KEY) throw new Error("MISSING_API_KEY");

    const systemPrompt = `You are a professional editor. Improve the following text directly. 
    Make it more professional, concise, and impactful. Fix grammar.
    Context: ${type} section of a Resume/CV/Cover Letter.
    Return ONLY the enhanced text. Do not add quotes or conversational filler.`;

    try {
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
                    { role: "user", content: text }
                ],
                temperature: 0.7,
            })
        });
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Enhancement Failed:", error);
        throw new Error("ENHANCE_FAILED");
    }
};
