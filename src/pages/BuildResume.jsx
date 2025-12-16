import React, { useState, useRef, useEffect } from 'react';
import { FilePlus, Upload, ArrowRight, User, Briefcase, GraduationCap, Zap, CheckCircle, Download, FileText, Image as ImageIcon, File, Sparkles, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

import { extractTextFromPDF } from '../utils/pdfParser';
import { parseResumeText } from '../utils/resumeParser';
import { optimizeText, generateSummary, hasApiKey, saveApiKey, parseDocumentWithAI, analyzeGap } from '../utils/aiService';
import { calculateATSScore, getScoreCategory, getATSRecommendations } from '../utils/atsScorer';
import { colorThemes, fontPairings, layouts } from '../utils/templates';


import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import DesignStudio from '../components/DesignStudio';
import ResumeRenderer from '../components/ResumeRenderer';

export default function BuildResume() {
    const [step, setStep] = useState('choice'); // choice, wizard, template, editor
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [resumeData, setResumeData] = useState({
        personal: { fullName: '', email: '', phone: '', title: '', summary: '' },
        experience: [],
        education: [],
        skills: ''
    });

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            {step === 'choice' && <ChoiceStep onNext={(type) => setStep(type === 'new' ? 'wizard' : 'smart-rewrite')} />}
            {step === 'wizard' && <WizardStep data={resumeData} setData={setResumeData} onNext={() => setStep('template')} />}
            {step === 'template' && <DesignStudio onNext={(config) => { setSelectedTemplate(config); setStep('editor'); }} />}
            {step === 'editor' && <EditorStep data={resumeData} setData={setResumeData} template={selectedTemplate} />}
            {step === 'smart-rewrite' && <SmartRewriteStep onNext={(data) => { setResumeData(prev => ({ ...prev, ...data })); setStep('template'); }} onCancel={() => setStep('choice')} />}
        </div>
    );
}

function ChoiceStep({ onNext }) {
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>How would you like to start?</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '4rem' }}>
                Choose the best way to create your professional resume.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Create New Card */}
                <button
                    onClick={() => onNext('new')}
                    className="glass hover-scale"
                    style={{
                        padding: '3rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'inherit',
                        transition: 'all 0.3s'
                    }}
                >
                    <div style={{ background: 'rgba(139, 92, 246, 0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FilePlus size={32} color="#a78bfa" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Create from Scratch</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>Build a new resume step-by-step using our smart wizard and premium templates.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: 'auto' }}>
                        Start Fresh <ArrowRight size={20} />
                    </div>
                </button>

                {/* AI Generate Card */}
                <button
                    onClick={() => onNext('smart-rewrite')}
                    className="glass hover-scale"
                    style={{
                        padding: '3rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
                        border: '1px solid var(--glass-border)',
                        color: 'inherit',
                        transition: 'all 0.3s'
                    }}
                >
                    <div style={{ background: 'rgba(236, 72, 153, 0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={32} color="#f472b6" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Smart AI Rewrite</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>Upload your resume & job description. AI will rewrite it to match the role perfectly.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 'bold', marginTop: 'auto' }}>
                        Generate for Job <ArrowRight size={20} />
                    </div>
                </button>
            </div>
        </div>
    );
}

function SmartRewriteStep({ onNext, onCancel }) {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    const [showKeyModal, setShowKeyModal] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');

    const handleProcess = async () => {
        if (!file || !jobDescription) {
            alert("Please upload a file and enter a job description.");
            return;
        }

        // Check for API Key first
        if (!hasApiKey()) {
            setShowKeyModal(true);
            return;
        }

        startProcessing();
    };

    const startProcessing = async () => {
        setIsProcessing(true);
        try {
            // 1. Extract Text
            setStatus('Reading Resume PDF...');
            const text = await extractTextFromPDF(file);

            setStatus('AI is Extracting all data...');
            const parsedData = await parseDocumentWithAI(text, 'resume');

            // 2. Rewrite Summary
            setStatus('AI is optimizing your Professional Summary...');
            const newSummary = await generateSummary(parsedData, jobDescription);
            parsedData.personal.summary = newSummary;

            // 3. Gap Analysis
            setStatus('AI is performing Gap Analysis...');
            const gapAnalysis = await analyzeGap(parsedData, jobDescription);

            // 4. Rewrite Experience
            setStatus('AI is optimizing your Experience bullets...');
            if (parsedData.experience && parsedData.experience.length > 0) {
                const optimizedExp = await Promise.all(parsedData.experience.map(async (exp) => {
                    const optimizedDesc = await optimizeText(exp.description, 'experience description', jobDescription);
                    return { ...exp, description: optimizedDesc };
                }));
                parsedData.experience = optimizedExp;
            }

            setStatus('Refining final details...');
            await new Promise(resolve => setTimeout(resolve, 800));
            onNext({ ...parsedData, gapAnalysis });

        } catch (error) {
            console.error("AI Processing Error:", error);
            if (error.message === 'MISSING_API_KEY') {
                setShowKeyModal(true);
            } else if (error.message === 'PDF_TEXT_EMPTY') {
                alert("The uploaded PDF seems to be an image or empty. Please upload a text-based PDF or copy-paste your details.");
            } else {
                alert("Error processing resume. Please try again.");
            }
            setIsProcessing(false);
            setStatus('');
        }
    };

    const handleSaveKey = () => {
        if (apiKeyInput.trim().startsWith('sk-')) {
            saveApiKey(apiKeyInput.trim());
            setShowKeyModal(false);
            startProcessing();
        } else {
            alert("Invalid API Key. It should start with 'sk-'");
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={onCancel} style={{ marginBottom: '2rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
            </button>

            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Smart AI Rewrite</h2>
            <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>
                We'll extract your resume content and use AI to rewrite it specifically for the job you're applying to.
            </p>

            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>1. Upload Current Resume (PDF)</label>
                    <div
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            border: '2px dashed var(--glass-border)',
                            borderRadius: '8px',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: file ? 'rgba(52, 211, 153, 0.1)' : 'transparent'
                        }}
                    >
                        <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} accept=".pdf" style={{ display: 'none' }} />
                        {file ? (
                            <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={24} /> {file.name} Selected
                            </div>
                        ) : (
                            <div style={{ color: '#94a3b8' }}>
                                <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                                <p>Click to upload PDF</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>2. Paste Job Description</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                        style={{
                            width: '100%',
                            height: '200px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            padding: '1rem',
                            color: 'white',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: isProcessing ? 'gray' : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem'
                    }}
                >
                    {isProcessing ? (
                        <>Processing... <span className="animate-spin">⏳</span></>
                    ) : (
                        <>Analyze & Rewrite <Sparkles size={20} /></>
                    )}
                </button>
            </div>

            {isProcessing && (
                <div style={{ textAlign: 'center', color: '#94a3b8', animation: 'fadeIn 0.5s' }}>
                    <p style={{ fontSize: '1.2rem' }}>{status}</p>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '1rem', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                            width: '50%',
                            height: '100%',
                            background: 'var(--primary)',
                            animation: 'slideUp 2s infinite linear',
                            transformOrigin: 'left'
                        }}></div>
                    </div>
                </div>
            )}

            {/* API Key Modal */}
            {showKeyModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass" style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Enter OpenAI API Key</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            To use the AI features safely, please provide your own OpenAI API key.
                            The key is stored locally in your browser and never sent to our servers.
                        </p>
                        <input
                            type="password"
                            placeholder="sk-..."
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', marginBottom: '1.5rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                borderRadius: '6px', color: 'white'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setShowKeyModal(false)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSaveKey} style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Save & Continue</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function WizardStep({ data, setData, onNext }) {
    const [activeTab, setActiveTab] = useState('personal'); // personal, experience, education, skills

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: <User size={18} /> },
        { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
        { id: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
        { id: 'skills', label: 'Skills', icon: <Zap size={18} /> },
    ];

    const handleNext = () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        } else {
            onNext();
        }
    };

    const handleBack = () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id);
        }
    };

    const handleChange = (section, field, value) => {
        setData(prev => {
            if (section === 'skills') return { ...prev, skills: value };
            return {
                ...prev,
                [section]: { ...prev[section], [field]: value }
            };
        });
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Progress Steps */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--glass-border)', zIndex: 0 }}></div>
                {tabs.map((tab, index) => {
                    const isActive = tab.id === activeTab;
                    const isCompleted = tabs.findIndex(t => t.id === activeTab) > index;
                    return (
                        <div key={tab.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: isActive || isCompleted ? 'var(--primary)' : 'var(--glass-bg)',
                                border: isActive ? '2px solid white' : '1px solid var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                transition: 'all 0.3s'
                            }}>
                                {isCompleted ? <CheckCircle size={20} /> : tab.icon}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: isActive ? 'white' : '#94a3b8', fontWeight: isActive ? 'bold' : 'normal' }}>{tab.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Form Content */}
            <div className="glass" style={{ padding: '3rem' }}>
                {activeTab === 'personal' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Let's start with the basics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <Input label="Full Name" placeholder="e.g. John Doe" value={data.personal.fullName} onChange={(e) => handleChange('personal', 'fullName', e.target.value)} />
                            <Input label="Job Title" placeholder="e.g. Software Engineer" value={data.personal.title} onChange={(e) => handleChange('personal', 'title', e.target.value)} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <Input label="Email" placeholder="e.g. john@example.com" value={data.personal.email} onChange={(e) => handleChange('personal', 'email', e.target.value)} />
                            <Input label="Phone" placeholder="e.g. +1 234 567 890" value={data.personal.phone} onChange={(e) => handleChange('personal', 'phone', e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>Professional Summary</label>
                            <textarea
                                placeholder="Briefly describe your professional background and goals..."
                                value={data.personal.summary}
                                onChange={(e) => handleChange('personal', 'summary', e.target.value)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontFamily: 'inherit',
                                    minHeight: '120px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'experience' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Work Experience</h2>

                        {data.experience.map((exp, index) => (
                            <div key={index} className="glass" style={{ padding: '1.5rem', marginBottom: '1rem', position: 'relative' }}>
                                <button
                                    onClick={() => {
                                        const newExp = [...data.experience];
                                        newExp.splice(index, 1);
                                        setData(prev => ({ ...prev, experience: newExp }));
                                    }}
                                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                                >
                                    Remove
                                </button>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <Input
                                        label="Job Title"
                                        placeholder="e.g. Product Manager"
                                        value={exp.role}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].role = e.target.value;
                                            setData(prev => ({ ...prev, experience: newExp }));
                                        }}
                                    />
                                    <Input
                                        label="Company"
                                        placeholder="e.g. Google"
                                        value={exp.company}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].company = e.target.value;
                                            setData(prev => ({ ...prev, experience: newExp }));
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <Input
                                        label="Start Date"
                                        placeholder="e.g. Jan 2020"
                                        value={exp.start}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].start = e.target.value;
                                            setData(prev => ({ ...prev, experience: newExp }));
                                        }}
                                    />
                                    <Input
                                        label="End Date"
                                        placeholder="e.g. Present"
                                        value={exp.end}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].end = e.target.value;
                                            setData(prev => ({ ...prev, experience: newExp }));
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>Description</label>
                                    <textarea
                                        placeholder="Describe your responsibilities and achievements..."
                                        value={exp.description}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].description = e.target.value;
                                            setData(prev => ({ ...prev, experience: newExp }));
                                        }}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontFamily: 'inherit',
                                            minHeight: '80px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setData(prev => ({ ...prev, experience: [...prev.experience, { role: '', company: '', start: '', end: '', description: '' }] }))}
                            style={{ background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', padding: '1rem', borderRadius: '8px', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            + Add Position
                        </button>
                    </div>
                )}

                {activeTab === 'education' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Education</h2>

                        {data.education.map((edu, index) => (
                            <div key={index} className="glass" style={{ padding: '1.5rem', marginBottom: '1rem', position: 'relative' }}>
                                <button
                                    onClick={() => {
                                        const newEdu = [...data.education];
                                        newEdu.splice(index, 1);
                                        setData(prev => ({ ...prev, education: newEdu }));
                                    }}
                                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                                >
                                    Remove
                                </button>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <Input
                                        label="School / University"
                                        placeholder="e.g. Stanford University"
                                        value={edu.school}
                                        onChange={(e) => {
                                            const newEdu = [...data.education];
                                            newEdu[index].school = e.target.value;
                                            setData(prev => ({ ...prev, education: newEdu }));
                                        }}
                                    />
                                    <Input
                                        label="Degree"
                                        placeholder="e.g. Bachelor of Science"
                                        value={edu.degree}
                                        onChange={(e) => {
                                            const newEdu = [...data.education];
                                            newEdu[index].degree = e.target.value;
                                            setData(prev => ({ ...prev, education: newEdu }));
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Input
                                        label="Field of Study"
                                        placeholder="e.g. Computer Science"
                                        value={edu.field}
                                        onChange={(e) => {
                                            const newEdu = [...data.education];
                                            newEdu[index].field = e.target.value;
                                            setData(prev => ({ ...prev, education: newEdu }));
                                        }}
                                    />
                                    <Input
                                        label="Graduation Year"
                                        placeholder="e.g. 2022"
                                        value={edu.year}
                                        onChange={(e) => {
                                            const newEdu = [...data.education];
                                            newEdu[index].year = e.target.value;
                                            setData(prev => ({ ...prev, education: newEdu }));
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setData(prev => ({ ...prev, education: [...prev.education, { school: '', degree: '', field: '', year: '' }] }))}
                            style={{ background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', padding: '1rem', borderRadius: '8px', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            + Add Education
                        </button>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Skills</h2>
                        <p style={{ color: '#94a3b8' }}>Separate skills with commas (e.g. React, Node.js, Leadership)</p>
                        <textarea
                            placeholder="List your skills here..."
                            value={data.skills}
                            onChange={(e) => handleChange('skills', null, e.target.value)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '1rem',
                                borderRadius: '8px',
                                color: 'white',
                                fontFamily: 'inherit',
                                minHeight: '150px',
                                fontSize: '1.1rem',
                                lineHeight: '1.6'
                            }}
                        />
                    </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                    <button
                        onClick={activeTab === 'personal' ? () => window.location.reload() : handleBack}
                        style={{
                            background: 'transparent',
                            color: '#94a3b8',
                            padding: '0.75rem 1.5rem',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            visibility: activeTab === 'personal' ? 'hidden' : 'visible'
                        }}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.75rem 2rem',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        {activeTab === 'skills' ? 'Finish & Choose Template' : 'Next'} <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function Input({ label, placeholder, value, onChange }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
        </div>
    );
}


function EditorStep({ data, setData, template }) {
    const previewRef = useRef(null);
    const [atsScore, setAtsScore] = useState(0);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [recommendations, setRecommendations] = useState([]);

    // Drag and Drop State
    const [sectionOrder, setSectionOrder] = useState([
        { id: 'summary', label: 'Professional Summary', icon: <FileText size={16} /> },
        { id: 'experience', label: 'Work Experience', icon: <Briefcase size={16} /> },
        { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
        { id: 'skills', label: 'Skills', icon: <Zap size={16} /> }
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setSectionOrder((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Calculate ATS score when data changes
    useEffect(() => {
        const score = calculateATSScore(data);
        setAtsScore(score);
        const recs = getATSRecommendations(data);
        setRecommendations(recs);
    }, [data]);

    const handleOptimizeSummary = async () => {
        setIsOptimizing(true);
        try {
            const optimized = await generateSummary(data);
            setData(prev => ({
                ...prev,
                personal: { ...prev.personal, summary: optimized }
            }));
        } catch (error) {
            console.error('AI optimization failed', error);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!previewRef.current) return;
        try {
            const canvas = await html2canvas(previewRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${data.personal.fullName || 'resume'}.pdf`);
        } catch (err) {
            console.error("PDF Export failed", err);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    const handleDownloadJPG = async () => {
        if (!previewRef.current) return;
        const canvas = await html2canvas(previewRef.current, { scale: 2 });
        canvas.toBlob(blob => {
            saveAs(blob, `${data.personal.fullName || 'resume'}.jpg`);
        });
    };

    const handleDownloadTXT = () => {
        let text = `Name: ${data.personal.fullName}\nTitle: ${data.personal.title}\nContact: ${data.personal.email} | ${data.personal.phone}\n\n`;

        if (data.personal.summary) text += `SUMMARY\n${data.personal.summary}\n\n`;

        if (data.experience.length > 0) {
            text += `EXPERIENCE\n`;
            data.experience.forEach(exp => {
                text += `${exp.role} at ${exp.company} (${exp.start} - ${exp.end})\n${exp.description}\n\n`;
            });
        }

        if (data.education.length > 0) {
            text += `EDUCATION\n`;
            data.education.forEach(edu => {
                text += `${edu.degree} in ${edu.field} from ${edu.school} (${edu.year})\n`;
            });
            text += `\n`;
        }

        if (data.skills) {
            text += `SKILLS\n${data.skills}\n`;
        }

        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `${data.personal.fullName || 'resume'}.txt`);
    };

    const handleChange = (section, field, value) => {
        setData(prev => {
            if (section === 'skills') return { ...prev, skills: value };
            return {
                ...prev,
                [section]: { ...prev[section], [field]: value }
            };
        });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: 'calc(100vh - 100px)' }}>
            {/* Editor Sidebar */}
            <div className="glass" style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} /> Content
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* AI Suggestions / Gap Analysis */}
                        {data.gapAnalysis && (
                            <div className="animate-fade-in" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f472b6' }}>
                                    <Sparkles size={18} /> AI Gap Analysis
                                </h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{data.gapAnalysis.score}%</div>
                                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Match Score</div>
                                </div>

                                {data.gapAnalysis.missingSkills && data.gapAnalysis.missingSkills.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fca5a5', marginBottom: '0.25rem' }}>Missing Skills:</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            {data.gapAnalysis.missingSkills.map((skill, i) => (
                                                <span key={i} style={{ fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {data.gapAnalysis.suggestions && (
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.25rem' }}>Actionable Suggestions:</div>
                                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                                            {data.gapAnalysis.suggestions.map((sugg, i) => (
                                                <li key={i} style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{sugg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Personal Section */}
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#a78bfa' }}>Personal Info</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <Input label="Full Name" value={data.personal.fullName} onChange={(e) => handleChange('personal', 'fullName', e.target.value)} />
                                <Input label="Job Title" value={data.personal.title} onChange={(e) => handleChange('personal', 'title', e.target.value)} />
                                <Input label="Email" value={data.personal.email} onChange={(e) => handleChange('personal', 'email', e.target.value)} />
                                <Input label="Phone" value={data.personal.phone} onChange={(e) => handleChange('personal', 'phone', e.target.value)} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Summary</label>
                                    <textarea
                                        value={data.personal.summary}
                                        onChange={(e) => handleChange('personal', 'summary', e.target.value)}
                                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.5rem', color: 'white', minHeight: '80px', fontFamily: 'inherit' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#a78bfa' }}>Skills</h3>
                            <textarea
                                value={data.skills}
                                onChange={(e) => handleChange('skills', null, e.target.value)}
                                placeholder="Comma separated skills"
                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.5rem', color: 'white', minHeight: '80px', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Reorder Sections */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowRight size={20} style={{ transform: 'rotate(90deg)' }} /> Layout
                    </h2>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sectionOrder}
                            strategy={verticalListSortingStrategy}
                        >
                            {sectionOrder.map(section => (
                                <SortableItem key={section.id} id={section.id} label={section.label} icon={section.icon} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>

                {/* AI Tools Section */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={20} /> AI Tools
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={handleOptimizeSummary}
                            disabled={isOptimizing}
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                cursor: isOptimizing ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: 'bold',
                                opacity: isOptimizing ? 0.6 : 1
                            }}
                        >
                            <Sparkles size={16} /> {isOptimizing ? 'Generating...' : 'Generate Summary'}
                        </button>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>✨ AI will analyze your data and create a professional summary</p>
                    </div>
                </div>

                {/* ATS Score Panel */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} /> ATS Score
                    </h2>
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 'bold', color: getScoreCategory(atsScore).color }}>{atsScore}</span>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getScoreCategory(atsScore).color }}>{getScoreCategory(atsScore).label}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ 100</div>
                            </div>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ height: '100%', background: getScoreCategory(atsScore).color, width: `${atsScore}%`, transition: 'width 0.5s' }}></div>
                        </div>
                        {recommendations.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>Recommendations:</h4>
                                <ul style={{ fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '1.2rem', margin: 0 }}>
                                    {recommendations.slice(0, 3).map((rec, i) => (
                                        <li key={i} style={{ marginBottom: '0.3rem' }}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={20} /> Export
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={handleDownloadPDF}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}
                        >
                            <File size={16} /> PDF
                        </button>
                        <button
                            onClick={handleDownloadJPG}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}
                        >
                            <ImageIcon size={16} /> JPG
                        </button>
                        <button
                            onClick={handleDownloadTXT}
                            style={{ background: '#64748b', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', gridColumn: 'span 2' }}
                        >
                            <FileText size={16} /> Text File
                        </button>
                    </div>
                </div>
            </div>

            {/* Resume Preview */}
            <div style={{ background: '#525252', borderRadius: '8px', padding: '2rem', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
                <div
                    ref={previewRef}
                    style={{
                        background: 'white',
                        width: '210mm',
                        minHeight: '297mm',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                        transformOrigin: 'top center',
                        transform: 'scale(0.9)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <ResumeRenderer data={data} template={template} sectionOrder={sectionOrder} />
                </div>
            </div>
        </div>
    );
}

function SortableItem(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'grab',
        touchAction: 'none',
        ...props.style
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div style={{ color: '#94a3b8' }}>☰</div>
            <div style={{ color: '#a78bfa' }}>{props.icon}</div>
            <div style={{ flex: 1, fontWeight: '500' }}>{props.label}</div>
        </div>
    );
}
