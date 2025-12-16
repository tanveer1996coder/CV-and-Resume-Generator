import React, { useState, useRef } from 'react';
import { ArrowRight, User, Briefcase, FileText, Download, CheckCircle, Sparkles, Mail, MapPin, Upload } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { extractTextFromPDF } from '../utils/pdfParser';
import { generateCoverLetter, hasApiKey, saveApiKey, parseDocumentWithAI, enhanceContent } from '../utils/aiService';
import { ColorPalettes, FontPairings, Layouts } from '../utils/themeConfig';

export default function BuildCoverLetter() {
    const [step, setStep] = useState('choice'); // choice, wizard, template, editor
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [data, setData] = useState({
        sender: { fullName: '', email: '', phone: '', address: '' },
        recipient: { name: '', title: '', company: '', address: '' },
        content: { subject: '', greeting: '', body: '', closing: 'Sincerely,' }
    });

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            {step === 'choice' && <ChoiceStep onNext={(type) => setStep(type === 'new' ? 'wizard' : 'smart-gen')} />}
            {step === 'wizard' && <WizardStep data={data} setData={setData} onNext={() => setStep('template')} />}
            {step === 'smart-gen' && <SmartGeneratorStep onNext={(generatedData) => { setData(prev => ({ ...prev, ...generatedData })); setStep('template'); }} onCancel={() => setStep('choice')} />}
            {step === 'template' && <TemplateStep onNext={(id) => { setSelectedTemplate(id); setStep('editor'); }} />}
            {step === 'editor' && <EditorStep data={data} setData={setData} template={selectedTemplate} />}
        </div>
    );
}

function ChoiceStep({ onNext }) {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Create a Cover Letter</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '4rem' }}>
                Craft a compelling cover letter that gets you hired.
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
                    <div style={{ background: 'rgba(139, 92, 246, 0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={32} color="#a78bfa" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Start from Scratch</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>Use our guided wizard to build your letter step-by-step.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: 'auto' }}>
                        Start Building <ArrowRight size={20} />
                    </div>
                </button>

                <button
                    onClick={() => onNext('smart-gen')}
                    className="glass hover-scale"
                    style={{
                        padding: '3rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
                        border: '1px solid var(--glass-border)',
                        color: 'inherit'
                    }}
                >
                    <div style={{ background: 'rgba(6, 182, 212, 0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={32} color="#22d3ee" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>AI Generator</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>Upload Resume + Job Description. We'll write the letter for you.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22d3ee', fontWeight: 'bold', marginTop: 'auto' }}>
                        Generate AI Letter <ArrowRight size={20} />
                    </div>
                </button>
            </div>
        </div>
    );
}


function SmartGeneratorStep({ onNext, onCancel }) {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');

    const handleProcess = async () => {
        if (!file || !jobDescription) {
            alert("Please upload Resume PDF and enter Job Description.");
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
            setStatus('Reading Resume...');
            const text = await extractTextFromPDF(file);

            setStatus('AI is Analyzing your profile...');
            const resumeData = await parseDocumentWithAI(text, 'resume');

            setStatus('AI is Drafting your Cover Letter...');
            const letter = await generateCoverLetter(resumeData, jobDescription);

            // Populate Data
            const newData = {
                sender: { ...resumeData.personal },
                content: letter
            };

            await new Promise(resolve => setTimeout(resolve, 800));
            onNext(newData);

        } catch (error) {
            console.error(error);
            if (error.message === 'MISSING_API_KEY') {
                setShowKeyModal(true);
            } else if (error.message === 'PDF_TEXT_EMPTY') {
                alert("The uploaded PDF seems to be an image or empty. Please upload a text-based PDF.");
            } else {
                alert("Error generating cover letter.");
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
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>AI Cover Letter Generator</h2>
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>1. Upload Your Resume (PDF)</label>
                    <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed var(--glass-border)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(52, 211, 153, 0.1)' : 'transparent' }}>
                        <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} accept=".pdf" style={{ display: 'none' }} />
                        {file ? <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><CheckCircle size={24} /> {file.name} Selected</div> : <div style={{ color: '#94a3b8' }}><Upload size={32} style={{ marginBottom: '0.5rem' }} /><p>Click to upload PDF</p></div>}
                    </div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>2. Job Description</label>
                    <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description..." style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', color: 'white' }} />
                </div>
                <button onClick={handleProcess} disabled={isProcessing} style={{ width: '100%', padding: '1rem', background: isProcessing ? 'gray' : 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    {isProcessing ? 'Generating...' : <><Sparkles size={20} /> Generate Letter</>}
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
    const [activeTab, setActiveTab] = useState('sender'); // sender, recipient, content

    const tabs = [
        { id: 'sender', label: 'Your Details', icon: <User size={18} /> },
        { id: 'recipient', label: 'Recipient', icon: <Briefcase size={18} /> },
        { id: 'content', label: 'Content', icon: <FileText size={18} /> },
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
        setData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
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
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                {isCompleted ? <CheckCircle size={20} /> : tab.icon}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: isActive ? 'white' : '#94a3b8' }}>{tab.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="glass" style={{ padding: '3rem' }}>
                {activeTab === 'sender' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your Information</h2>
                        <Input label="Full Name" value={data.sender.fullName} onChange={(e) => handleChange('sender', 'fullName', e.target.value)} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <Input label="Email" value={data.sender.email} onChange={(e) => handleChange('sender', 'email', e.target.value)} />
                            <Input label="Phone" value={data.sender.phone} onChange={(e) => handleChange('sender', 'phone', e.target.value)} />
                        </div>
                        <Input label="Address (Optional)" value={data.sender.address} onChange={(e) => handleChange('sender', 'address', e.target.value)} />
                    </div>
                )}

                {activeTab === 'recipient' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Recipient Details</h2>
                        <Input label="Hiring Manager Name" placeholder="e.g. Jane Smith" value={data.recipient.name} onChange={(e) => handleChange('recipient', 'name', e.target.value)} />
                        <Input label="Recipient Title" placeholder="e.g. Senior Recruiter" value={data.recipient.title} onChange={(e) => handleChange('recipient', 'title', e.target.value)} />
                        <Input label="Company Name" placeholder="e.g. Acme Corp" value={data.recipient.company} onChange={(e) => handleChange('recipient', 'company', e.target.value)} />
                        <Input label="Company Address" placeholder="e.g. 123 Business Rd, Tech City" value={data.recipient.address} onChange={(e) => handleChange('recipient', 'address', e.target.value)} />
                    </div>
                )}

                {activeTab === 'content' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Letter Content</h2>
                        <Input label="Subject Line" placeholder="e.g. Application for Software Engineer Position" value={data.content.subject} onChange={(e) => handleChange('content', 'subject', e.target.value)} />
                        <Input label="Greeting" placeholder="e.g. Dear Ms. Smith," value={data.content.greeting} onChange={(e) => handleChange('content', 'greeting', e.target.value)} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>Body Paragraphs</label>
                            <textarea
                                value={data.content.body}
                                onChange={(e) => handleChange('content', 'body', e.target.value)}
                                placeholder="Write your cover letter here..."
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontFamily: 'inherit',
                                    minHeight: '200px',
                                    lineHeight: '1.6'
                                }}
                            />
                        </div>
                        <Input label="Closing" placeholder="e.g. Sincerely," value={data.content.closing} onChange={(e) => handleChange('content', 'closing', e.target.value)} />
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                    <button onClick={handleNext} style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 2rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {activeTab === 'content' ? 'Choose Template' : 'Next'} <ArrowRight size={18} />
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
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Design Your Letter</h1>
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
                            <div style={{ marginTop: '2rem', height: '6px', width: '30%', background: '#e2e8f0' }}></div>
                            <div style={{ marginTop: '2rem', height: '8px', width: '80%', background: '#f1f5f9' }}></div>
                            <div style={{ marginTop: '0.5rem', height: '8px', width: '90%', background: '#f1f5f9' }}></div>
                            <div style={{ marginTop: '0.5rem', height: '8px', width: '75%', background: '#f1f5f9' }}></div>
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
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('cover-letter.pdf');
    };

    const handleEnhance = async (text, fieldPath, type = 'general') => {
        if (!text) return;
        setEnhancing(fieldPath);
        try {
            const enhancedText = await enhanceContent(text, type);
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
                <button onClick={handleDownloadPDF} style={{ width: '100%', background: '#ef4444', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Download size={18} /> Download PDF
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Expandable Sections */}
                    <details open style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>Sender Details</summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
                            <Input label="Your Name" value={data.sender.fullName} onChange={(e) => setData(prev => ({ ...prev, sender: { ...prev.sender, fullName: e.target.value } }))} />
                            <Input label="Your Email" value={data.sender.email} onChange={(e) => setData(prev => ({ ...prev, sender: { ...prev.sender, email: e.target.value } }))} />
                            <Input label="Your Phone" value={data.sender.phone} onChange={(e) => setData(prev => ({ ...prev, sender: { ...prev.sender, phone: e.target.value } }))} />
                        </div>
                    </details>

                    <details open style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>Letter Content</summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block' }}>Subject Line</label>
                                <input type="text" value={data.content.subject} onChange={(e) => setData(prev => ({ ...prev, content: { ...prev.content, subject: e.target.value } }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block' }}>Greeting</label>
                                <input type="text" value={data.content.greeting} onChange={(e) => setData(prev => ({ ...prev, content: { ...prev.content, greeting: e.target.value } }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block' }}>Body Paragraphs</label>
                                <textarea value={data.content.body} onChange={(e) => setData(prev => ({ ...prev, content: { ...prev.content, body: e.target.value } }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'white', minHeight: '200px', lineHeight: '1.5' }} />
                                <button onClick={() => handleEnhance(data.content.body, 'content.body', 'Cover Letter Body')} disabled={enhancing === 'content.body'} style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {enhancing === 'content.body' ? 'Improving...' : <><Sparkles size={12} /> AI Improve</>}
                                </button>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block' }}>Closing</label>
                                <input type="text" value={data.content.closing} onChange={(e) => setData(prev => ({ ...prev, content: { ...prev.content, closing: e.target.value } }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'white' }} />
                            </div>
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
                    {themeLayout.id === 'modern' && (
                        <>
                            <div style={{ width: '30%', background: themeColor.primary, color: 'white', padding: '20mm 5mm 20mm 10mm' }}>
                                <h1 style={{ fontSize: '2rem', lineHeight: '1.2', fontWeight: 'bold' }}>{data.sender.fullName || 'Your Name'}</h1>
                                <div style={{ marginTop: '1rem', opacity: 0.9 }}>
                                    {data.sender.email} <br /> {data.sender.phone}
                                    {data.sender.address && <><br />{data.sender.address}</>}
                                </div>
                            </div>
                            <div style={{ width: '70%', padding: '20mm 10mm' }}>
                                <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                                </div>
                                <div style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{data.recipient.name}</div>
                                    <div>{data.recipient.title}</div>
                                    <div>{data.recipient.company}</div>
                                    <div>{data.recipient.address}</div>
                                </div>

                                <div style={{ marginBottom: '1rem', fontWeight: 'bold', color: themeColor.primary, fontSize: '1.1rem' }}>
                                    RE: {data.content.subject}
                                </div>

                                <div style={{ marginBottom: '1rem' }}>{data.content.greeting}</div>
                                <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '2rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    {data.content.body}
                                </div>
                                <div>
                                    {data.content.closing}
                                    <br /><br />
                                    {data.sender.fullName}
                                </div>
                            </div>
                        </>
                    )}

                    {themeLayout.id !== 'modern' && (
                        <div style={{ width: '100%', padding: '20mm' }}>
                            <div style={{ borderBottom: `2px solid ${themeColor.primary}`, paddingBottom: '1rem', marginBottom: '2rem', textAlign: themeLayout.id === 'minimal' ? 'center' : 'left' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: themeColor.primary }}>{data.sender.fullName || 'Your Name'}</h1>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                    {data.sender.email} | {data.sender.phone}
                                    {data.sender.address && ` | ${data.sender.address}`}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                <strong>Date:</strong> {new Date().toLocaleDateString()}
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div>{data.recipient.name}</div>
                                <div>{data.recipient.title}</div>
                                <div>{data.recipient.company}</div>
                                <div>{data.recipient.address}</div>
                            </div>

                            <div style={{ marginBottom: '1.5rem', fontWeight: 'bold', borderLeft: `4px solid ${themeColor.secondary}`, paddingLeft: '1rem', fontSize: '1.1rem' }}>
                                RE: {data.content.subject}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>{data.content.greeting}</div>
                            <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '2rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                {data.content.body}
                            </div>
                            <div>
                                {data.content.closing}
                                <br /><br />
                                {data.sender.fullName}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
