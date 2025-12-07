import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const ContentOptimizer = ({ section, content, onOptimize }) => {
    const [loading, setLoading] = useState(false);

    const handleOptimize = async () => {
        setLoading(true);
        // Mock call or real call depending on implementation
        // await onOptimize(section, content); 
        // For now just simulating a callback
        if (onOptimize) await onOptimize();
        setLoading(false);
    }

    return (
        <button
            onClick={handleOptimize}
            disabled={loading}
            className="text-xs flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
        >
            {loading ? '✨ Optimizing...' : '✨ Optimize with AI'}
        </button>
    );
};

export const ExperienceForm = ({ experience, onChange, onRemove, onOptimize }) => {
    return (
        <div className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-700">Position #{experience.id || 'New'}</h4>
                <button onClick={onRemove} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
                <input
                    type="text"
                    placeholder="Job Title"
                    className="p-2 border rounded"
                    value={experience.title || ''}
                    onChange={(e) => onChange('title', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Company"
                    className="p-2 border rounded"
                    value={experience.company || ''}
                    onChange={(e) => onChange('company', e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
                <input
                    type="text"
                    placeholder="Start Date"
                    className="p-2 border rounded"
                    value={experience.startDate || ''}
                    onChange={(e) => onChange('startDate', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="End Date"
                    className="p-2 border rounded"
                    value={experience.endDate || ''}
                    onChange={(e) => onChange('endDate', e.target.value)}
                />
            </div>

            <div className="mt-2">
                <div className="flex justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-500">Description</label>
                    <ContentOptimizer section="experience" content={experience.description} onOptimize={onOptimize} />
                </div>
                <textarea
                    placeholder="Describe your responsibilities..."
                    className="w-full p-2 border rounded h-24"
                    value={experience.description || ''}
                    onChange={(e) => onChange('description', e.target.value)}
                />
            </div>
        </div>
    );
};

export const EducationForm = ({ education, onChange, onRemove }) => {
    return (
        <div className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-700">School #{education.id || 'New'}</h4>
                <button onClick={onRemove} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-2">
                <input
                    type="text"
                    placeholder="School / University"
                    className="p-2 border rounded"
                    value={education.school || ''}
                    onChange={(e) => onChange('school', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Degree"
                    className="p-2 border rounded"
                    value={education.degree || ''}
                    onChange={(e) => onChange('degree', e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Graduation Year"
                    className="p-2 border rounded"
                    value={education.year || ''}
                    onChange={(e) => onChange('year', e.target.value)}
                />
            </div>
        </div>
    );
};
