// Mock AI Service - Simulates AI-powered content optimization
export const optimizeText = async (text, context = 'general') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!text || text.trim().length === 0) {
        return text;
    }

    // Simple text improvements using string replacements
    let improved = text;

    // Action verb improvements
    const improvements = {
        'worked on': 'spearheaded',
        'helped': 'facilitated',
        'made': 'engineered',
        'did': 'executed',
        'was responsible for': 'managed',
        'created': 'developed',
        'used': 'leveraged',
        'improved': 'optimized',
        'changed': 'transformed',
        'handled': 'orchestrated'
    };

    Object.entries(improvements).forEach(([weak, strong]) => {
        const regex = new RegExp(`\\b${weak}\\b`, 'gi');
        improved = improved.replace(regex, strong);
    });

    // Add quantification suggestions (mock)
    if (context === 'experience' && !improved.match(/\d+%|\d+ [a-z]+/i)) {
        improved += ' [AI Suggestion: Add metrics or percentages to strengthen impact]';
    }

    return improved;
};

export const generateSummary = async (data) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { personal, experience, skills } = data;

    if (!personal.title) {
        return 'Dynamic professional with proven track record of delivering results.';
    }

    const skillsList = skills ? skills.split(',').slice(0, 3).map(s => s.trim()).join(', ') : 'various skills';
    const yearsExp = experience.length > 0 ? `${experience.length}+` : 'multiple';

    return `Results-driven ${personal.title} with ${yearsExp} years of experience. Expertise in ${skillsList}. Proven ability to drive innovation and deliver exceptional outcomes.`;
};
