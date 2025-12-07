import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { Briefcase, GraduationCap, Palette, Layers } from 'lucide-react';

const PurposePage = () => {
    const navigate = useNavigate();
    const { loadPurposeConfig } = useResume();

    const handleSelect = (purpose) => {
        loadPurposeConfig(purpose);
        navigate('/templates');
    };

    const options = [
        { id: 'job', label: 'Job Application', icon: <Briefcase size={32} />, desc: 'Standard professional structure.' },
        { id: 'scholarship', label: 'Scholarship / Academic', icon: <GraduationCap size={32} />, desc: 'Focus on research and awards.' },
        { id: 'creative', label: 'Creative Field', icon: <Palette size={32} />, desc: 'Portfolio-centric layouts.' },
        { id: 'other', label: 'General / Other', icon: <Layers size={32} />, desc: 'Customizable structure.' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">What is this Resume for?</h1>
            <p className="text-gray-600 mb-8">We will tailor the sections and designs based on your goal.</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
                {options.map((opt) => (
                    <div
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        className="bg-white p-8 rounded-2xl border-2 border-transparent hover:border-indigo-500 shadow-lg hover:shadow-xl cursor-pointer transition-all flex flex-col items-center text-center group"
                    >
                        <div className="text-indigo-500 group-hover:scale-110 transition-transform mb-4">
                            {opt.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{opt.label}</h3>
                        <p className="text-sm text-gray-500">{opt.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PurposePage;
