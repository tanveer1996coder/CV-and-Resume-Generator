import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { FileText, ArrowRight } from 'lucide-react';

const InputPage = () => {
    const navigate = useNavigate();
    const { jobDescription, setJobDescription } = useResume();

    const handleNext = () => {
        navigate('/categories');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-6">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-10 transform transition-all hover:scale-[1.01]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Step 1: The Goal</h1>
                        <p className="text-gray-500">Tell us what this resume is for.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Paste Job Description or Resume Goal
                        </label>
                        <div className="relative">
                            <textarea
                                className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-700 bg-gray-50 resize-none outline-none"
                                placeholder="e.g. Applying for a Senior React Developer role at Google. Key requirements: React, Node.js, Performance Optimization..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">
                                {jobDescription.length} characters
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            * Our AI will use this to recommend the best template and optimize your content.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleNext}
                            disabled={jobDescription.length < 10}
                            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${jobDescription.length < 10
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                                }`}
                        >
                            Next Step <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputPage;
