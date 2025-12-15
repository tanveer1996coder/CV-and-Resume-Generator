// ATS (Applicant Tracking System) Scorer - Heuristic-based resume analysis
export const calculateATSScore = (resumeData) => {
    let score = 0;
    const maxScore = 100;

    // Personal Info Completeness (20 points)
    const personalFields = ['fullName', 'email', 'phone', 'title'];
    const filledPersonal = personalFields.filter(field => resumeData.personal[field]?.trim()).length;
    score += (filledPersonal / personalFields.length) * 20;

    // Summary (10 points)
    if (resumeData.personal.summary && resumeData.personal.summary.length > 50) {
        score += 10;
    } else if (resumeData.personal.summary) {
        score += 5;
    }

    // Experience Section (30 points)
    if (resumeData.experience.length > 0) {
        score += 10; // Has experience

        // Quality check: descriptions
        const completeExperiences = resumeData.experience.filter(exp =>
            exp.role && exp.company && exp.description && exp.description.length > 30
        );
        score += (completeExperiences.length / resumeData.experience.length) * 15;

        // Check for quantifiable achievements (numbers, percentages)
        const hasMetrics = resumeData.experience.some(exp =>
            exp.description && /\d+%|\d+ [a-z]+/i.test(exp.description)
        );
        if (hasMetrics) score += 5;
    }

    // Education Section (15 points)
    if (resumeData.education.length > 0) {
        score += 8;
        const completeEducation = resumeData.education.filter(edu =>
            edu.school && edu.degree && edu.field
        );
        score += (completeEducation.length / resumeData.education.length) * 7;
    }

    // Skills Section (15 points)
    if (resumeData.skills) {
        const skillCount = resumeData.skills.split(',').filter(s => s.trim()).length;
        if (skillCount >= 10) {
            score += 15;
        } else if (skillCount >= 5) {
            score += 10;
        } else if (skillCount > 0) {
            score += 5;
        }
    }

    // Length check (10 points) - Not too short, not too long
    const totalTextLength = JSON.stringify(resumeData).length;
    if (totalTextLength > 500 && totalTextLength < 5000) {
        score += 10;
    } else if (totalTextLength > 200) {
        score += 5;
    }

    return Math.min(Math.round(score), maxScore);
};

export const getScoreCategory = (score) => {
    if (score >= 80) return { label: 'Excellent', color: '#10b981' };
    if (score >= 60) return { label: 'Good', color: '#3b82f6' };
    if (score >= 40) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Needs Improvement', color: '#ef4444' };
};

export const getATSRecommendations = (resumeData) => {
    const recommendations = [];

    if (!resumeData.personal.summary || resumeData.personal.summary.length < 50) {
        recommendations.push('Add a professional summary (at least 50 characters)');
    }

    if (resumeData.experience.length === 0) {
        recommendations.push('Add work experience to strengthen your resume');
    }

    if (resumeData.education.length === 0) {
        recommendations.push('Include your educational background');
    }

    const skillCount = resumeData.skills ? resumeData.skills.split(',').filter(s => s.trim()).length : 0;
    if (skillCount < 5) {
        recommendations.push('List more skills (aim for at least 5-10)');
    }

    const hasMetrics = resumeData.experience.some(exp =>
        exp.description && /\d+%|\d+ [a-z]+/i.test(exp.description)
    );
    if (!hasMetrics && resumeData.experience.length > 0) {
        recommendations.push('Add quantifiable achievements (numbers, percentages) to experience');
    }

    return recommendations;
};
