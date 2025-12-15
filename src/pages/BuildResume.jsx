import React, { useState, useRef, useEffect } from 'react';
import { FilePlus, Upload, ArrowRight, User, Briefcase, GraduationCap, Zap, CheckCircle, Download, FileText, Image as ImageIcon, File, Sparkles, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

import { extractTextFromPDF } from '../utils/pdfParser';
import { parseResumeText } from '../utils/resumeParser';
import { optimizeText, generateSummary } from '../utils/aiService';
import { calculateATSScore, getScoreCategory, getATSRecommendations } from '../utils/atsScorer';


import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
            {step === 'choice' && <ChoiceStep onNext={(type) => setStep(type === 'new' ? 'wizard' : 'upload')} onUpload={(data) => { setResumeData(prev => ({ ...prev, ...data })); setStep('wizard'); }} />}
            {step === 'wizard' && <WizardStep data={resumeData} setData={setResumeData} onNext={() => setStep('template')} />}
            {step === 'template' && <TemplateStep onNext={(id) => { setSelectedTemplate(id); setStep('editor'); }} />}
            {step === 'editor' && <EditorStep data={resumeData} setData={setResumeData} template={selectedTemplate} />}
            {step === 'upload' && <div className="glass p-8">Upload feature coming sort of soon... <button onClick={() => setStep('choice')}>Back</button></div>}
        </div>
    );
}

function ChoiceStep({ onNext, onUpload }) {
    const fileInputRef = React.useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // For now only PDF, but logic is extensible
            if (file.type === 'application/pdf') {
                const text = await extractTextFromPDF(file);
                const parsedData = parseResumeText(text);
                onUpload(parsedData);
            } else {
                alert("Please upload a PDF file for now.");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to read file.");
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf"
                onChange={handleFileChange}
            />
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

                {/* Upload Card */}
                <button
                    onClick={() => fileInputRef.current.click()}
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
                    <div style={{ background: 'rgba(236, 72, 153, 0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={32} color="#f472b6" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Upload Existing</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>Upload your current PDF resume and we'll help you redesign and optimize it.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 'bold', marginTop: 'auto' }}>
                        Upload Resume <ArrowRight size={20} />
                    </div>
                </button>
            </div>
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

function TemplateStep({ onNext }) {
    const templates = [
        { id: 'modern', name: 'Modern', color: '#8b5cf6', description: 'Clean and colorful, perfect for tech and creative roles.' },
        { id: 'professional', name: 'Professional', color: '#3b82f6', description: 'Traditional and structured, great for corporate jobs.' },
        { id: 'minimal', name: 'Minimal', color: '#64748b', description: 'Simple and elegant, focused purely on content.' }
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', textAlign: 'center' }}>Choose a Template</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '4rem', textAlign: 'center' }}>
                Select a design that fits your personal brand. You can change this later.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {templates.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onNext(template.id)}
                        className="glass hover-scale"
                        style={{
                            padding: '2rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            color: 'inherit',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{ height: '300px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${template.color} ` }}>
                            <span style={{ fontSize: '1.5rem', color: template.color, fontWeight: 'bold' }}>{template.name} Preview</span>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{template.name}</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>{template.description}</p>
                    </button>
                ))}
            </div>
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
                        padding: '15mm',
                        color: 'black',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                        transformOrigin: 'top center',
                        transform: 'scale(0.9)', // Scale down slightly to fit comfortably
                        position: 'relative'
                    }}
                >
                    {/* Header */}
                    <div style={{ borderBottom: `2px solid ${template === 'modern' ? '#8b5cf6' : '#333'}`, paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: template === 'modern' ? '#8b5cf6' : '#000' }}>{data.personal.fullName || 'Your Name'}</h1>
                        <p style={{ fontSize: '1.2rem', color: '#555', marginTop: '0.5rem' }}>{data.personal.title || 'Your Job Title'}</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                            <span>{data.personal.email}</span>
                            <span>|</span>
                            <span>{data.personal.phone}</span>
                        </div>
                    </div>

                    {/* Summary */}
                    {/* Watermark */}
                    <div className="watermark-draft" data-html2canvas-ignore="true" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        fontSize: '8rem',
                        fontWeight: 'bold',
                        color: 'rgba(0,0,0,0.05)',
                        pointerEvents: 'none',
                        zIndex: 0,
                        userSelect: 'none',
                        whiteSpace: 'nowrap'
                    }}>
                        DRAFT
                    </div>

                    {/* Dynamic Sections */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {sectionOrder.map(section => {
                            switch (section.id) {
                                case 'summary':
                                    return data.personal.summary && (
                                        <div key="summary" style={{ marginBottom: '2rem' }}>
                                            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '1rem', color: '#333' }}>Professional Summary</h3>
                                            <p style={{ lineHeight: '1.6', color: '#444' }}>{data.personal.summary}</p>
                                        </div>
                                    );
                                case 'experience':
                                    return data.experience.length > 0 && (
                                        <div key="experience" style={{ marginBottom: '2rem' }}>
                                            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '1rem', color: '#333' }}>Experience</h3>
                                            {data.experience.map((exp, i) => (
                                                <div key={i} style={{ marginBottom: '1.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{exp.role}</div>
                                                        <div style={{ color: '#666' }}>{exp.start} - {exp.end}</div>
                                                    </div>
                                                    <div style={{ fontWeight: '500', color: '#444', marginBottom: '0.5rem' }}>{exp.company}</div>
                                                    <p style={{ lineHeight: '1.5', color: '#555', whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                case 'education':
                                    return data.education.length > 0 && (
                                        <div key="education" style={{ marginBottom: '2rem' }}>
                                            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '1rem', color: '#333' }}>Education</h3>
                                            {data.education.map((edu, i) => (
                                                <div key={i} style={{ marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <div style={{ fontWeight: 'bold' }}>{edu.school}</div>
                                                        <div style={{ color: '#666' }}>{edu.year}</div>
                                                    </div>
                                                    <div>{edu.degree} in {edu.field}</div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                case 'skills':
                                    return data.skills && (
                                        <div key="skills">
                                            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '1rem', color: '#333' }}>Skills</h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {data.skills.split(',').map((skill, i) => (
                                                    <span key={i} style={{ background: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.9rem', color: '#374151' }}>
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </div>
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
