import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { Briefcase, Code, PenTool, GraduationCap } from 'lucide-react';

const CategoryPage = () => {
    const navigate = useNavigate();
    const { loadPurposeConfig, jobDescription } = useResume();

    const handleSelect = (category) => {
        loadPurposeConfig(category);
        navigate('/designs');
    };

    // Simple rule-based suggestion (AI simulation)
    const isTech = jobDescription.toLowerCase().match(/developer|software|engineer|code|react|node/);
    const isCreative = jobDescription.toLowerCase().match(/design|art|creative|writer|editor/);
    const isAcademic = jobDescription.toLowerCase().match(/research|professor|phd|student|scholarship/);

    const categories = [
        { id: 'job', label: 'Technical / Engineering', icon: <Code size={40} />, recommended: isTech },
        { id: 'creative', label: 'Creative / Artistic', icon: <PenTool size={40} />, recommended: isCreative },
        { id: 'job', label: 'Corporate / Professional', icon: <Briefcase size={40} />, recommended: !isTech && !isCreative && !isAcademic },
        { id: 'scholarship', label: 'Academic / Resume', icon: <GraduationCap size={40} />, recommended: isAcademic },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Step 2: Choose a Category</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Based on your goal, we've analyzed the best structure for you.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleSelect(cat.id)}
                        className={`relative bg-white rounded-2xl p-8 border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-xl flex flex-col items-center text-center
                    ${cat.recommended ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-transparent hover:border-gray-200'}
                 `}
                    >
                        {cat.recommended && (
                            <div className="absolute -top-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Recommended
                            </div>
                        )}
                        <div className={`mb-6 p-4 rounded-full ${cat.recommended ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                            {cat.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{cat.label}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryPage;
