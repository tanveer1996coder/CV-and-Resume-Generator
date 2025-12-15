import React, { useState } from 'react';
import { uploadResume } from '../services/api';
import { Upload, AlertTriangle, CheckCircle, ArrowRight, FileText, AlertCircle, Lightbulb, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFiles(files[0]);
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) handleFiles(e.target.files[0]);
    };

    const handleFiles = async (file) => {
        setAnalyzing(true);
        try {
            const data = await uploadResume(file);
            setResult(data.analysis);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze resume.");
        } finally {
            setAnalyzing(false);
        }
    };

    // Circular Progress Component
    const ScoreCircle = ({ score, label, color }) => {
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (score / 100) * circumference;

        return (
            <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="transform -rotate-90 w-24 h-24">
                        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200" />
                        <circle
                            cx="48" cy="48" r={radius}
                            stroke="currentColor" strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className={`${color} transition-all duration-1000 ease-out`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-xl font-bold text-gray-800">{score}%</span>
                </div>
                <span className="mt-2 font-semibold text-gray-600 font-sans tracking-wide text-sm uppercase">{label}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Resume Checkup</h1>
            <p className="text-gray-500 mb-10 text-lg">Get an instant expert audit of your CV.</p>

            {!result && (
                <div
                    className={`w-full max-w-xl h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all bg-white shadow-sm cursor-pointer
                    ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-105' : 'border-gray-300 hover:border-indigo-400 hover:shadow-md'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {analyzing ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                            <p className="text-lg font-semibold text-gray-700">Analyzing your resume...</p>
                            <p className="text-sm text-gray-400 mt-2">Checking for ATS compatibility & red flags</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-indigo-100 p-4 rounded-full mb-4">
                                <Upload className="text-indigo-600" size={32} />
                            </div>
                            <p className="text-xl font-bold text-gray-800 mb-2">Upload your Resume</p>
                            <p className="text-sm text-gray-500 mb-6">Drag & drop or browse (PDF only)</p>
                            <label className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transform hover:-translate-y-0.5 transition-all shadow-lg font-medium">
                                Choose File
                                <input type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                            </label>
                        </>
                    )}
                </div>
            )}

            {result && (
                <div className="w-full max-w-4xl animate-fade-in-up">
                    {/* Score Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-around">
                            <div className="text-left">
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">ATS Score</h3>
                                <p className="text-sm text-gray-500">Robot readability</p>
                            </div>
                            <ScoreCircle score={result.atsScore} label="" color={result.atsScore > 70 ? 'text-green-500' : result.atsScore > 40 ? 'text-yellow-500' : 'text-red-500'} />
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-around">
                            <div className="text-left">
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">Credibility</h3>
                                <p className="text-sm text-gray-500">Human impact</p>
                            </div>
                            <ScoreCircle score={result.credibility} label="" color={result.credibility > 70 ? 'text-blue-500' : result.credibility > 40 ? 'text-purple-500' : 'text-pink-500'} />
                        </div>
                    </div>

                    {/* Detailed Report */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* Red Flags / Loopholes */}
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                            <h3 className="flex items-center gap-2 text-xl font-bold text-red-800 mb-6">
                                <AlertTriangle className="fill-red-100 text-red-600" /> Critical Loopholes
                            </h3>
                            <ul className="space-y-4">
                                {result.loopholes.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-red-700 bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                                        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                                        <span className="text-sm font-medium leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Improvement Plan */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                            <h3 className="flex items-center gap-2 text-xl font-bold text-indigo-900 mb-6">
                                <Lightbulb className="fill-yellow-100 text-yellow-600" /> Improvement Plan
                            </h3>
                            <ul className="space-y-4">
                                {result.improvements.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-indigo-800 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                        <CheckCircle size={18} className="mt-0.5 text-green-500 flex-shrink-0" />
                                        <span className="text-sm font-medium leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gray-900 text-white rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-800 to-black opacity-50 z-0"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">Don't let a bad resume hold you back.</h2>
                            <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
                                You have the skills. We have the tools. Build a professional, ATS-optimized resume in minutes with our AI builder.
                            </p>
                            <button
                                onClick={() => navigate('/purpose')}
                                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg inline-flex items-center gap-2 transform transition hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <FileText size={20} /> Build New Resume <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadPage;
