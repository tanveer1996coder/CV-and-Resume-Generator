
export const parseResumeText = (text) => {
    const data = {
        personal: { fullName: '', email: '', phone: '', title: '', summary: '' },
        experience: [],
        education: [],
        skills: ''
    };

    // --- Simple Heuristics ---

    // Email
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
        data.personal.email = emailMatch[0];
    }

    // Phone (Basic US/International format support)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
        data.personal.phone = phoneMatch[0];
    }

    // Full Name - Heuristic: First line that isn't too long or empty
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
        // Assume first non-empty line is the name
        data.personal.fullName = lines[0];
    }

    // Skills - Look for "Skills" keyword
    const skillsIndex = text.toLowerCase().indexOf('skills');
    if (skillsIndex !== -1) {
        // Take a chunk of text after "Skills"
        const skillsText = text.substring(skillsIndex + 6, skillsIndex + 300);
        // Remove newlines and excess whitespace
        data.skills = skillsText.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
    }

    // Summary - Look for specific keywords
    const summaryKeywords = ['summary', 'profile', 'about me'];
    let summaryIndex = -1;
    for (const keyword of summaryKeywords) {
        const idx = text.toLowerCase().indexOf(keyword);
        if (idx !== -1) {
            summaryIndex = idx + keyword.length;
            break;
        }
    }

    if (summaryIndex !== -1) {
        const summaryEnd = text.indexOf('\n\n', summaryIndex);
        data.personal.summary = text.substring(summaryIndex, summaryEnd !== -1 ? summaryEnd : summaryIndex + 500).trim();
    }

    return data;
};
