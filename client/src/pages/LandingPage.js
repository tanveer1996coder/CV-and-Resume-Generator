import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Sparkles } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
            <div className="max-w-4xl w-full text-center space-y-8">
                <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">
                    AI-Powered <span className="text-yellow-300">Resume Builder</span>
                </h1>
                <p className="text-xl opacity-90">
                    Create ATS-friendly, professional resumes in minutes with the power of AI.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    {/* Option 1: Start Fresh */}
                    <div
                        onClick={() => navigate('/start')}
                        className="group cursor-pointer bg-white bg-opacity-10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <FileText size={48} className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Create New</h2>
                        <p className="opacity-80 group-hover:opacity-100">
                            Select a template and build from scratch with AI assistance.
                        </p>
                    </div>

                    {/* Option 2: Upload Existing */}
                    <div
                        onClick={() => navigate('/upload')}
                        className="group cursor-pointer bg-white bg-opacity-10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <Upload size={48} className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Upload Existing</h2>
                        <p className="opacity-80 group-hover:opacity-100">
                            Upload your current CV (PDF) and let AI reformat it.
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex items-center justify-center space-x-2 opacity-75">
                    <Sparkles size={20} />
                    <span>Powered by GPT-4o Mini & Supabase</span>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
