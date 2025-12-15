export const mockData = {
    personalInfo: {
        fullName: 'Alex Morgan',
        role: 'Senior Product Designer',
        email: 'alex.morgan@design.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alexmorgan',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    summary: 'Creative and detail-oriented Product Designer with over 8 years of experience in building user-centric digital products. Proven track record of improving user engagement and streamlining complex workflows. Passionate about minimalism and accessibility.',
    sections: [
        {
            id: 'exp',
            title: 'Experience',
            type: 'experience',
            column: 'main',
            items: [
                {
                    id: '1',
                    company: 'Creative Studio X',
                    role: 'Lead UX Designer',
                    date: '2020 - Present',
                    description: 'Led a team of 5 designers to revamp the core product interface, resulting in a 30% increase in user retention. Conducted user research and usability testing.'
                },
                {
                    id: '2',
                    company: 'Tech Solutions Inc.',
                    role: 'Senior UI Designer',
                    date: '2017 - 2020',
                    description: 'Designed and shipped mobile applications for Fortune 500 clients. Collaborated closely with engineering teams to ensure design feasibility and fidelity.'
                }
            ]
        },
        {
            id: 'edu',
            title: 'Education',
            type: 'education',
            column: 'sidebar',
            items: [
                {
                    id: '3',
                    institution: 'California College of Arts',
                    degree: 'BFA in Interaction Design',
                    year: '2013 - 2017'
                }
            ]
        },
        {
            id: 'skills',
            title: 'Skills',
            type: 'skills',
            column: 'sidebar',
            items: ['Figma', 'React', 'Prototyping', 'User Research', 'HTML/CSS', 'Design Systems']
        }
    ]
};
