import React, { createContext, useContext, useState } from 'react';

const ResumeContext = createContext();

export const useResume = () => useContext(ResumeContext);

const INITIAL_SECTIONS = {
    job: [
        { id: 'exp', type: 'experience', title: 'Work Experience', items: [], column: 'main' },
        { id: 'edu', type: 'education', title: 'Education', items: [], column: 'main' },
        { id: 'skills', type: 'skills', title: 'Skills', items: [], column: 'sidebar' },
    ],
    scholarship: [
        { id: 'edu', type: 'education', title: 'Education', items: [], column: 'main' },
        { id: 'awards', type: 'list', title: 'Awards & Honors', items: [], column: 'main' },
        { id: 'research', type: 'list', title: 'Research Experience', items: [], column: 'main' },
    ],
    creative: [
        { id: 'portfolio', type: 'list', title: 'Portfolio Projects', items: [], column: 'main' },
        { id: 'skills', type: 'skills', title: 'Technical Skills', items: [], column: 'sidebar' },
        { id: 'exp', type: 'experience', title: 'Experience', items: [], column: 'main' },
    ],
    cv: [
        { id: 'edu', type: 'education', title: 'Education', items: [], column: 'main' },
        { id: 'research', type: 'list', title: 'Research Experience', items: [], column: 'main' },
        { id: 'publications', type: 'list', title: 'Publications', items: [], column: 'main' },
        { id: 'grants', type: 'list', title: 'Grants & Awards', items: [], column: 'sidebar' },
        { id: 'teaching', type: 'experience', title: 'Teaching Experience', items: [], column: 'main' },
    ]
};


export const ResumeProvider = ({ children }) => {
    const [purpose, setPurpose] = useState('job');
    const [jobDescription, setJobDescription] = useState('');
    const [selectedDesign, setSelectedDesign] = useState('modern');

    const [activeDocument, setActiveDocument] = useState('resume'); // 'resume' or 'coverLetter'
    const [coverLetterData, setCoverLetterData] = useState({
        recipientName: '',
        recipientTitle: '',
        companyName: '',
        companyAddress: '',
        greeting: 'Dear Hiring Manager,',
        body: '',
        signOff: 'Sincerely,'
    });

    const [resumeData, setResumeData] = useState({
        personalInfo: { fullName: '', email: '', phone: '', linkedin: '', role: '', location: '', photo: null, photoFeedback: null },
        summary: '',
        sections: INITIAL_SECTIONS.job,
    });

    const updateCoverLetter = (field, value) => {
        setCoverLetterData(prev => ({ ...prev, [field]: value }));
    };

    const loadPurposeConfig = (selectedPurpose) => {
        setPurpose(selectedPurpose);
        setResumeData(prev => ({
            ...prev,
            sections: INITIAL_SECTIONS[selectedPurpose] || INITIAL_SECTIONS.job
        }));
    };

    const setDesign = (designId) => {
        setSelectedDesign(designId);
    }

    // Generic Update for Personal Info / Summary
    const updateMeta = (field, value) => {
        setResumeData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updatePersonalInfo = (field, value) => {
        setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    // Dynamic Section Management
    const addSection = (title, type) => {
        const newSection = { id: Date.now().toString(), type, title, items: [] };
        setResumeData(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
    };

    const removeSection = (sectionId) => {
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== sectionId)
        }));
    };

    const addItemToSection = (sectionId, item) => {
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.id === sectionId ? { ...s, items: [...s.items, item] } : s
            )
        }));
    };

    const updateSectionTitle = (sectionId, newTitle) => {
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === sectionId ? { ...s, title: newTitle } : s)
        }));
    };

    const updateSectionType = (sectionId, newType) => {
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === sectionId ? { ...s, type: newType } : s)
        }));
    };

    const updateSectionColumn = (sectionId, newColumn) => {
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === sectionId ? { ...s, column: newColumn } : s)
        }));
    };

    const reorderSections = (newSections) => {
        setResumeData(prev => ({
            ...prev,
            sections: newSections
        }));
    };

    const updateSectionItem = (sectionId, index, field, value) => {
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                const newItems = [...s.items];
                // If field is null/undefined, treat item as primitive (e.g., string for skills)
                if (!field) {
                    newItems[index] = value;
                } else {
                    newItems[index] = { ...newItems[index], [field]: value };
                }
                return { ...s, items: newItems };
            })
        }));
    };

    const removeSectionItem = (sectionId, index) => {
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return { ...s, items: s.items.filter((_, i) => i !== index) };
            })
        }));
    };

    return (
        <ResumeContext.Provider value={{
            resumeData,
            setResumeData,
            purpose,
            jobDescription,
            setJobDescription,
            selectedDesign,
            setDesign,
            loadPurposeConfig,
            updateMeta,
            updatePersonalInfo,
            addSection,
            removeSection,
            addItemToSection,
            updateSectionItem,
            removeSectionItem,
            updateSectionTitle,
            updateSectionType,

            updateSectionColumn,
            reorderSections,
            activeDocument,
            setActiveDocument,
            coverLetterData,
            updateCoverLetter
        }}>
            {children}
        </ResumeContext.Provider>
    );
};
