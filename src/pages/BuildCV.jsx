import React, { useState, useRef } from 'react';
import {
    FileText, User, Briefcase, GraduationCap, Zap, BookOpen, Award, ArrowRight, CheckCircle, Download, File, Sparkles, Upload
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { extractTextFromPDF } from '../utils/pdfParser';
import { optimizeText, generateSummary, hasApiKey, saveApiKey, parseDocumentWithAI, analyzeGap, enhanceContent } from '../utils/aiService';
import { ColorPalettes, FontPairings, Layouts } from '../utils/themeConfig';

export default function BuildCV() {
    const [step, setStep] = useState('choice'); // choice, wizard, template, editor
    const [selectedTemplate, setSelectedTemplate] = useState('academic');
    const [cvData, setCvData] = useState({
        personal: { fullName: '', title: '', email: '', phone: '', summary: '' },
        education: [],
        publications: [],
        experience: [],
        awards: [],
        skills: ''
    });

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            {step === 'choice' && <ChoiceStep onNext={(type) => setStep(type === 'new' ? 'wizard' : 'smart-ai')} />}
            {step === 'wizard' && <WizardStep data={cvData} setData={setCvData} onNext={() => setStep('template')} />}
            {step === 'smart-ai' && <SmartAIStep onNext={(data) => { setCvData(prev => ({ ...prev, ...data })); setStep('template'); }} onCancel={() => setStep('choice')} />}
            {step === 'template' && <TemplateStep onNext={(id) => { setSelectedTemplate(id); setStep('editor'); }} />}
            {step === 'editor' && <EditorStep data={cvData} setData={setCvData} template={selectedTemplate} />}
        </div>
    );
}

function ChoiceStep({ onNext }) {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Create Your CV</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '4rem' }}>
                Build a comprehensive academic or professional curriculum vitae.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
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
                        color: 'inherit'
                    }}
                >
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={32} color="#60a5fa" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Start Fresh</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>Create a detailed CV with sections for research, publications, and awards.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: 'auto' }}>
                        Start CV <ArrowRight size={20} />
                    </div>
                </button>

                <button
                    onClick={() => onNext('smart-ai')}
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
                        color: 'inherit'
                    }}
                >
                    <div style={{ background: 'rgba(236, 72, 153, 0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={32} color="#f472b6" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Smart AI Import</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>Upload your existing CV/Resume and let AI format and optimize it for you.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 'bold', marginTop: 'auto' }}>
                        Import with AI <ArrowRight size={20} />
                    </div>
                </button>
            </div>
        </div>
    );
}


function SmartAIStep({ onNext, onCancel }) {
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
        if (!hasApiKey()) {
            setShowKeyModal(true);
            return;
        }
        startProcessing();
    };

    const startProcessing = async () => {
        setIsProcessing(true);
        try {
            setStatus('Reading CV/Resume PDF...');
            const text = await extractTextFromPDF(file);

            setStatus('AI is Extracting structured data...');
            const parsedData = await parseDocumentWithAI(text, 'academic cv');

            setStatus('AI is optimizing Summary...');
            const newSummary = await generateSummary(parsedData, jobDescription);
            parsedData.personal.summary = newSummary;

            setStatus('AI is performing Gap Analysis...');
            const gapAnalysis = await analyzeGap(parsedData, jobDescription);

            setStatus('AI is optimizing Experience...');
            if (parsedData.experience && parsedData.experience.length > 0) {
                const optimizedExp = await Promise.all(parsedData.experience.map(async (exp) => {
                    const optimizedDesc = await optimizeText(exp.description, 'experience description', jobDescription);
                    return { ...exp, description: optimizedDesc };
                }));
                parsedData.experience = optimizedExp;
            }

            setStatus('Refining details...');
            await new Promise(resolve => setTimeout(resolve, 800));
            onNext({ ...parsedData, gapAnalysis });

        } catch (error) {
            console.error(error);
            if (error.message === 'MISSING_API_KEY') {
                setShowKeyModal(true);
            } else if (error.message === 'PDF_TEXT_EMPTY') {
                alert("The uploaded PDF seems to be an image or empty. Please upload a text-based PDF.");
            } else {
                alert("Error processing CV.");
            }
            setIsProcessing(false);
        }
    };

    const handleSaveKey = () => {
        if (apiKeyInput.trim().startsWith('sk-')) {
            saveApiKey(apiKeyInput.trim());
            setShowKeyModal(false);
            startProcessing();
        } else {
            alert("Invalid API Key.");
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={onCancel} style={{ marginBottom: '2rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
            </button>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Smart AI CV Import</h2>
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>1. Upload CV (PDF)</label>
                    <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed var(--glass-border)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(52, 211, 153, 0.1)' : 'transparent' }}>
                        <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} accept=".pdf" style={{ display: 'none' }} />
                        {file ? <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><CheckCircle size={24} /> {file.name} Selected</div> : <div style={{ color: '#94a3b8' }}><Upload size={32} style={{ marginBottom: '0.5rem' }} /><p>Click to upload PDF</p></div>}
                    </div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>2. Job / Research Description</label>
                    <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Enter job or research program description..." style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', color: 'white' }} />
                </div>
                <button onClick={handleProcess} disabled={isProcessing} style={{ width: '100%', padding: '1rem', background: isProcessing ? 'gray' : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    {isProcessing ? 'Processing...' : <><Sparkles size={20} /> Analyze & Import</>}
                </button>
            </div>
            {isProcessing && <div style={{ textAlign: 'center', color: '#94a3b8' }}>{status}</div>}
            {/* API Key Modal */}
            {showKeyModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass" style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Enter OpenAI API Key</h3>
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
    const [activeTab, setActiveTab] = useState('personal');

    const tabs = [
        { id: 'personal', label: 'Personal', icon: <User size={18} /> },
        { id: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
        { id: 'publications', label: 'Research', icon: <BookOpen size={18} /> },
        { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
        { id: 'awards', label: 'Awards', icon: <Award size={18} /> },
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

    const handleChange = (section, field, value) => {
        setData(prev => {
            if (section === 'skills') return { ...prev, skills: value };
            return { ...prev, [section]: { ...prev[section], [field]: value } };
        });
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative', overflowX: 'auto', paddingBottom: '1rem' }}>
                {/* Simplified progress bar for many steps */}
                {tabs.map((tab, index) => {
                    const isActive = tab.id === activeTab;
                    const isCompleted = tabs.findIndex(t => t.id === activeTab) > index;
                    return (
                        <div key={tab.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '80px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: isActive || isCompleted ? 'var(--primary)' : 'var(--glass-bg)',
                                border: isActive ? '2px solid white' : '1px solid var(--glass-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                {isCompleted ? <CheckCircle size={18} /> : tab.icon}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: isActive ? 'white' : '#94a3b8' }}>{tab.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="glass" style={{ padding: '3rem' }}>
                {activeTab === 'personal' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Personal Info</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <Input label="Full Name" value={data.personal.fullName} onChange={(e) => handleChange('personal', 'fullName', e.target.value)} />
                            <Input label="Current Title" value={data.personal.title} onChange={(e) => handleChange('personal', 'title', e.target.value)} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <Input label="Email" value={data.personal.email} onChange={(e) => handleChange('personal', 'email', e.target.value)} />
                            <Input label="Phone" value={data.personal.phone} onChange={(e) => handleChange('personal', 'phone', e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Professional Summary / Objective</label>
                            <textarea
                                value={data.personal.summary}
                                onChange={(e) => handleChange('personal', 'summary', e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '8px', color: 'white', minHeight: '100px' }}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'education' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Education</h2>
                        {data.education.map((edu, index) => (
                            <div key={index} className="glass" style={{ padding: '1rem', marginBottom: '1rem', position: 'relative' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Input label="Institution" value={edu.school} onChange={(e) => {
                                        const newEdu = [...data.education]; newEdu[index].school = e.target.value; setData({ ...data, education: newEdu });
                                    }} />
                                    <Input label="Year" value={edu.year} onChange={(e) => {
                                        const newEdu = [...data.education]; newEdu[index].year = e.target.value; setData({ ...data, education: newEdu });
                                    }} />
                                </div>
                                <Input label="Degree / Qualification" value={edu.degree} onChange={(e) => {
                                    const newEdu = [...data.education]; newEdu[index].degree = e.target.value; setData({ ...data, education: newEdu });
                                }} />
                            </div>
                        ))}
                        <button onClick={() => setData({ ...data, education: [...data.education, { school: '', year: '', degree: '' }] })} style={{ background: 'var(--glass-bg)', padding: '1rem', border: '1px dashed var(--glass-border)', color: 'var(--primary)' }}>+ Add Education</button>
                    </div>
                )}

                {activeTab === 'publications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Publications & Research</h2>
                        {data.publications.map((pub, index) => (
                            <div key={index} className="glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                <Input label="Title of Paper/Work" value={pub.title} onChange={(e) => {
                                    const newPub = [...data.publications]; newPub[index].title = e.target.value; setData({ ...data, publications: newPub });
                                }} />
                                <Input label="Journal / Conference" value={pub.journal} onChange={(e) => {
                                    const newPub = [...data.publications]; newPub[index].journal = e.target.value; setData({ ...data, publications: newPub });
                                }} />
                                <Input label="Year" value={pub.year} onChange={(e) => {
                                    const newPub = [...data.publications]; newPub[index].year = e.target.value; setData({ ...data, publications: newPub });
                                }} />
                            </div>
                        ))}
                        <button onClick={() => setData({ ...data, publications: [...data.publications, { title: '', journal: '', year: '' }] })} style={{ background: 'var(--glass-bg)', padding: '1rem', border: '1px dashed var(--glass-border)', color: 'var(--primary)' }}>+ Add Publication</button>
                    </div>
                )}

                {activeTab === 'experience' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Professional Experience</h2>
                        {data.experience.map((exp, index) => (
                            <div key={index} className="glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Input label="Role" value={exp.role} onChange={(e) => {
                                        const newExp = [...data.experience]; newExp[index].role = e.target.value; setData({ ...data, experience: newExp });
                                    }} />
                                    <Input label="Company" value={exp.company} onChange={(e) => {
                                        const newExp = [...data.experience]; newExp[index].company = e.target.value; setData({ ...data, experience: newExp });
                                    }} />
                                </div>
                                <Input label="Duration" value={exp.duration} onChange={(e) => {
                                    const newExp = [...data.experience]; newExp[index].duration = e.target.value; setData({ ...data, experience: newExp });
                                }} />
                                <div style={{ marginTop: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Description</label>
                                    <textarea value={exp.description} onChange={(e) => {
                                        const newExp = [...data.experience]; newExp[index].description = e.target.value; setData({ ...data, experience: newExp });
                                    }} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'white' }} />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setData({ ...data, experience: [...data.experience, { role: '', company: '', duration: '', description: '' }] })} style={{ background: 'var(--glass-bg)', padding: '1rem', border: '1px dashed var(--glass-border)', color: 'var(--primary)' }}>+ Add Experience</button>
                    </div>
                )}

                {activeTab === 'awards' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Awards & Grants</h2>
                        {data.awards.map((award, index) => (
                            <div key={index} className="glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                <Input label="Award Name" value={award.name} onChange={(e) => {
                                    const newAwards = [...data.awards]; newAwards[index].name = e.target.value; setData({ ...data, awards: newAwards });
                                }} />
                                <Input label="Year / Date" value={award.date} onChange={(e) => {
                                    const newAwards = [...data.awards]; newAwards[index].date = e.target.value; setData({ ...data, awards: newAwards });
                                }} />
                            </div>
                        ))}
                        <button onClick={() => setData({ ...data, awards: [...data.awards, { name: '', date: '' }] })} style={{ background: 'var(--glass-bg)', padding: '1rem', border: '1px dashed var(--glass-border)', color: 'var(--primary)' }}>+ Add Award</button>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Skills & Languages</h2>
                        <textarea
                            value={data.skills}
                            onChange={(e) => setData({ ...data, skills: e.target.value })}
                            placeholder="List your skills, languages, or other competencies..."
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', color: 'white', minHeight: '150px' }}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                    <button onClick={handleNext} style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 2rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {activeTab === 'skills' ? 'Choose Template' : 'Next'} <ArrowRight size={18} />
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
                    outline: 'none'
                }}
            />
        </div>
    );
}

function TemplateStep({ onNext }) {
    const [config, setConfig] = useState({ layout: 'modern', color: 'blue', font: 'sans' });

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Design Your CV</h1>
            <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>Mix and match layouts, colors, and fonts to create your unique style.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', textAlign: 'left' }}>
                {/* Preview Area */}
                <div className="glass" style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{
                        width: '100%', height: '100%', background: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        display: 'flex', flexDirection: 'column',
                        fontFamily: FontPairings.find(f => f.id === config.font).body.split(',')[0],
                        borderTop: `5px solid ${ColorPalettes.find(c => c.id === config.color).primary}`
                    }}>
                        {/* Mini Preview Mockup */}
                        <div style={{ padding: '2rem' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: ColorPalettes.find(c => c.id === config.color).primary }}>John Doe</div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Software Engineer</div>
                            <div style={{ marginTop: '1rem', height: '8px', width: '60%', background: '#f1f5f9' }}></div>
                            <div style={{ marginTop: '0.5rem', height: '8px', width: '80%', background: '#f1f5f9' }}></div>
                            <div style={{ marginTop: '2rem', height: '8px', width: '40%', background: '#e2e8f0' }}></div>
                            <div style={{ marginTop: '0.5rem', height: '6px', width: '100%', background: '#f8fafc' }}></div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Layout</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {Layouts.map(l => (
                                <button
                                    key={l.id}
                                    onClick={() => setConfig({ ...config, layout: l.id })}
                                    style={{ padding: '0.5rem', borderRadius: '6px', border: config.layout === l.id ? '2px solid var(--primary)' : '1px solid #444', background: config.layout === l.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer' }}
                                >
                                    {l.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Color Theme</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {ColorPalettes.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setConfig({ ...config, color: c.id })}
                                    style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: c.primary,
                                        border: config.color === c.id ? `3px solid white` : '1px solid rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        boxShadow: config.color === c.id ? '0 0 0 2px var(--primary)' : 'none'
                                    }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Typography</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {FontPairings.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setConfig({ ...config, font: f.id })}
                                    style={{ padding: '0.75rem', borderRadius: '6px', border: config.font === f.id ? '2px solid var(--primary)' : '1px solid #444', background: config.font === f.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer', fontFamily: f.body, textAlign: 'left' }}
                                >
                                    {f.name} <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>Aa</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => onNext(config)} style={{ marginTop: 'auto', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        Use This Style <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditorStep({ data, setData, template }) {
    const previewRef = useRef(null);
    const [enhancing, setEnhancing] = useState(null);

    // Resolve Theme Config
    const themeColor = ColorPalettes.find(c => c.id === template.color) || ColorPalettes[0];
    const themeFont = FontPairings.find(f => f.id === template.font) || FontPairings[0];
    const themeLayout = Layouts.find(l => l.id === template.layout) || Layouts[0];

    const handleDownloadPDF = async () => {
        if (!previewRef.current) return;
        const canvas = await html2canvas(previewRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }

        pdf.save('my-cv.pdf');
    };

    const handleEnhance = async (text, fieldPath, type = 'general') => {
        if (!text) return;
        setEnhancing(fieldPath);
        try {
            const enhancedText = await enhanceContent(text, type);
            // Helper to update deeply nested state based on path string "personal.summary" or "experience.0.description"
            setData(prev => {
                const newData = { ...prev };
                const parts = fieldPath.split('.');
                let current = newData;
                for (let i = 0; i < parts.length - 1; i++) {
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = enhancedText;
                return newData;
            });
        } catch (error) {
            alert("AI Enhancement failed.");
        }
        setEnhancing(null);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem', height: 'calc(100vh - 100px)' }}>
            <div className="glass" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Final Editor</h2>
                <button onClick={handleDownloadPDF} style={{ width: '100%', background: '#ef4444', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Download size={18} /> Download PDF
                </button>

                {data.gapAnalysis && (
                    <div className="animate-fade-in" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f472b6' }}>
                            <Sparkles size={18} /> AI Suggestion
                        </h3>
                        {data.gapAnalysis.suggestions && (
                            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                                {data.gapAnalysis.suggestions.slice(0, 3).map((sugg, i) => (
                                    <li key={i} style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{sugg}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <details open style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>Personal Details</summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
                            <Input label="Full Name" value={data.personal.fullName} onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, fullName: e.target.value } }))} />
                            <Input label="Title" value={data.personal.title} onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, title: e.target.value } }))} />
                            <Input label="Email" value={data.personal.email} onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, email: e.target.value } }))} />
                            <Input label="Phone" value={data.personal.phone} onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, phone: e.target.value } }))} />
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block' }}>Summary</label>
                                <textarea value={data.personal.summary} onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, summary: e.target.value } }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'white', minHeight: '80px' }} />
                                <button onClick={() => handleEnhance(data.personal.summary, 'personal.summary', 'Professional Summary')} disabled={enhancing === 'personal.summary'} style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {enhancing === 'personal.summary' ? 'Improving...' : <><Sparkles size={12} /> AI Improve</>}
                                </button>
                            </div>
                        </div>
                    </details>

                    <details style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>Experience ({data.experience.length})</summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
                            {data.experience.map((exp, index) => (
                                <div key={index} style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
                                    <Input label="Role" value={exp.role} onChange={(e) => { const n = [...data.experience]; n[index].role = e.target.value; setData({ ...data, experience: n }); }} />
                                    <Input label="Company" value={exp.company} onChange={(e) => { const n = [...data.experience]; n[index].company = e.target.value; setData({ ...data, experience: n }); }} />
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <textarea value={exp.description} onChange={(e) => { const n = [...data.experience]; n[index].description = e.target.value; setData({ ...data, experience: n }); }} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'white', minHeight: '60px' }} placeholder="Description..." />
                                        <button onClick={() => handleEnhance(exp.description, `experience.${index}.description`, 'Work Experience Description')} disabled={enhancing === `experience.${index}.description`} style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {enhancing === `experience.${index}.description` ? 'Improving...' : <><Sparkles size={12} /> AI Improve</>}
                                        </button>
                                    </div>
                                    <button onClick={() => { const n = [...data.experience]; n.splice(index, 1); setData({ ...data, experience: n }); }} style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                </div>
                            ))}
                            <button onClick={() => setData({ ...data, experience: [...data.experience, { role: 'New Role', company: 'Company', duration: '', description: '' }] })} style={{ background: 'var(--glass-bg)', padding: '0.5rem', border: '1px dashed var(--glass-border)', color: 'var(--primary)', cursor: 'pointer' }}>+ Add Role</button>
                        </div>
                    </details>

                    <details style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>Education ({data.education.length})</summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
                            {data.education.map((edu, index) => (
                                <div key={index} style={{ borderLeft: '2px solid #22d3ee', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
                                    <Input label="School" value={edu.school} onChange={(e) => { const n = [...data.education]; n[index].school = e.target.value; setData({ ...data, education: n }); }} />
                                    <Input label="Degree" value={edu.degree} onChange={(e) => { const n = [...data.education]; n[index].degree = e.target.value; setData({ ...data, education: n }); }} />
                                    <button onClick={() => { const n = [...data.education]; n.splice(index, 1); setData({ ...data, education: n }); }} style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                </div>
                            ))}
                            <button onClick={() => setData({ ...data, education: [...data.education, { school: 'New School', degree: 'Degree', year: '' }] })} style={{ background: 'var(--glass-bg)', padding: '0.5rem', border: '1px dashed var(--glass-border)', color: '#22d3ee', cursor: 'pointer' }}>+ Add Education</button>
                        </div>
                    </details>

                    <details style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>Skills</summary>
                        <div style={{ padding: '0.5rem' }}>
                            <textarea value={data.skills} onChange={(e) => setData({ ...data, skills: e.target.value })} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'white', minHeight: '100px' }} />
                        </div>
                    </details>

                </div>
            </div>

            <div style={{ background: '#525252', borderRadius: '8px', padding: '2rem', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
                <div
                    ref={previewRef}
                    style={{
                        background: 'white',
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '0',
                        color: 'black',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                        transform: 'scale(0.9)',
                        transformOrigin: 'top center',
                        fontFamily: themeFont.body,
                        display: 'flex',
                        flexDirection: themeLayout.id === 'modern' ? 'row' : 'column'
                    }}
                >
                    {/* --- Sidebar Layout (Modern) --- */}
                    {themeLayout.id === 'modern' && (
                        <>
                            <div style={{ width: '30%', background: themeColor.primary, color: 'white', padding: '20mm 5mm 20mm 10mm' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h1 style={{ fontSize: '2rem', lineHeight: '1.2', fontWeight: 'bold' }}>{data.personal.fullName}</h1>
                                    <div style={{ fontSize: '1rem', opacity: 0.9, marginTop: '0.5rem' }}>{data.personal.title}</div>
                                </div>

                                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                                    <div>{data.personal.email}</div>
                                    <div>{data.personal.phone}</div>
                                </div>

                                {data.skills && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>SKILLS</h3>
                                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{data.skills}</p>
                                    </div>
                                )}

                                {data.awards.length > 0 && (
                                    <div>
                                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>AWARDS</h3>
                                        {data.awards.map((award, i) => (
                                            <div key={i} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                {award.name} <br /><span style={{ opacity: 0.7 }}>{award.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ width: '70%', padding: '20mm 10mm' }}>
                                {data.personal.summary && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ color: themeColor.primary, borderBottom: `2px solid ${themeColor.secondary}`, paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>PROFILE</h3>
                                        <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{data.personal.summary}</p>
                                    </div>
                                )}

                                {data.experience.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ color: themeColor.primary, borderBottom: `2px solid ${themeColor.secondary}`, paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>EXPERIENCE</h3>
                                        {data.experience.map((exp, i) => (
                                            <div key={i} style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                    <span style={{ fontSize: '1.1rem' }}>{exp.role}</span>
                                                    <span style={{ color: '#666' }}>{exp.duration}</span>
                                                </div>
                                                <div style={{ color: themeColor.primary, fontWeight: '500', marginBottom: '0.5rem' }}>{exp.company}</div>
                                                <p style={{ fontSize: '0.95rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {data.education.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ color: themeColor.primary, borderBottom: `2px solid ${themeColor.secondary}`, paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>EDUCATION</h3>
                                        {data.education.map((edu, i) => (
                                            <div key={i} style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontWeight: 'bold' }}>{edu.school}</div>
                                                <div>{edu.degree} <span style={{ color: '#666' }}>| {edu.year}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* --- Classic/Minimal/Other Layouts (Top Down) --- */}
                    {themeLayout.id !== 'modern' && (
                        <div style={{ width: '100%', padding: '20mm', textAlign: themeLayout.id === 'minimal' ? 'center' : 'left' }}>
                            <div style={{ borderBottom: themeLayout.id === 'minimal' ? 'none' : '1px solid #000', paddingBottom: '1rem', marginBottom: '2rem', textAlign: themeLayout.id === 'minimal' ? 'center' : 'left' }}>
                                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, color: themeColor.primary }}>{data.personal.fullName}</h1>
                                <p style={{ margin: '0.5rem 0', fontSize: '1.2rem', color: themeColor.secondary }}>{data.personal.title}</p>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>{data.personal.email} • {data.personal.phone}</p>
                            </div>

                            <div style={{ textAlign: 'left' }}>
                                {data.personal.summary && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ color: themeColor.primary, borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Summary</h3>
                                        <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{data.personal.summary}</p>
                                    </div>
                                )}

                                {data.experience.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ color: themeColor.primary, borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Experience</h3>
                                        {data.experience.map((exp, i) => (
                                            <div key={i} style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <strong style={{ fontSize: '1.1rem' }}>{exp.role}</strong>
                                                    <span>{exp.duration}</span>
                                                </div>
                                                <div style={{ color: themeColor.secondary, fontWeight: 'bold', marginBottom: '0.25rem' }}>{exp.company}</div>
                                                <p style={{ fontSize: '0.95rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {data.education.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ color: themeColor.primary, borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Education</h3>
                                        {data.education.map((edu, i) => (
                                            <div key={i} style={{ marginBottom: '0.5rem' }}>
                                                <strong>{edu.school}</strong>, {edu.year}
                                                <div>{edu.degree}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {data.skills && (
                                    <div>
                                        <h3 style={{ color: themeColor.primary, borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Skills</h3>
                                        <p>{data.skills}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
