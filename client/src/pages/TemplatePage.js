import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const TemplatePage = () => {
    const navigate = useNavigate();

    const templates = [
        { id: 'modern', name: 'Modern Professional', category: 'job', color: 'bg-blue-100' },
        { id: 'minimal', name: 'Clean Minimalist', category: 'scholarship', color: 'bg-gray-100' },
        { id: 'creative', name: 'Artistic Portfolio', category: 'creative', color: 'bg-pink-100' }, // Placeholder visual
        { id: 'compact', name: 'Compact Executive', category: 'job', color: 'bg-indigo-100' },
    ];

    const handleSelect = (templateId) => {
        // In a real app, store this in context
        console.log("Selected", templateId);
        navigate('/editor');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose a Template</h1>

                {/* Categories / Filters could go here */}

                <div className="grid md:grid-cols-3 gap-8">
                    {templates.map((t) => (
                        <div key={t.id} className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all">
                            {/* Mock Preview */}
                            <div className={`h-64 ${t.color} flex items-center justify-center`}>
                                <span className="text-gray-400 font-bold uppercase tracking-widest">{t.name}</span>
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{t.name}</h3>
                                <div className="flex gap-2 mb-4">
                                    <span className="px-2 py-1 bg-gray-100 text-xs font-semibold rounded text-gray-600 uppercase">{t.category}</span>
                                    <span className="px-2 py-1 bg-green-100 text-xs font-semibold rounded text-green-600">ATS Friendly</span>
                                </div>
                                <button
                                    onClick={() => handleSelect(t.id)}
                                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Use This Template
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplatePage;
