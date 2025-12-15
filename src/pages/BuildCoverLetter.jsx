import React, { useState, useRef } from 'react';
import { ArrowRight, User, Briefcase, FileText, Download, CheckCircle, Sparkles, Mail, MapPin } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

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
            {step === 'choice' && <ChoiceStep onNext={() => setStep('wizard')} />}
            {step === 'wizard' && <WizardStep data={data} setData={setData} onNext={() => setStep('template')} />}
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
            <button
                onClick={onNext}
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
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto'
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
    const templates = [
        { id: 'modern', name: 'Modern', color: '#8b5cf6' },
        { id: 'professional', name: 'Professional', color: '#3b82f6' },
        { id: 'minimal', name: 'Minimal', color: '#64748b' }
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '3rem' }}>Choose a Template</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {templates.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onNext(template.id)}
                        className="glass hover-scale"
                        style={{ padding: '2rem', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'inherit' }}
                    >
                        <div style={{ height: '300px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${template.color}` }}>
                            <span style={{ fontSize: '1.5rem', color: template.color, fontWeight: 'bold' }}>{template.name}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function EditorStep({ data, setData, template }) {
    const previewRef = useRef(null);

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

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: 'calc(100vh - 100px)' }}>
            <div className="glass" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Editor</h2>
                {/* Inputs for quick edits */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handleDownloadPDF} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold' }}>Download PDF</button>
                    </div>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Input label="Body Content" value={data.content.body} onChange={(e) => setData(prev => ({ ...prev, content: { ...prev.content, body: e.target.value } }))} />
                </div>
            </div>

            <div style={{ background: '#525252', borderRadius: '8px', padding: '2rem', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
                <div
                    ref={previewRef}
                    style={{
                        background: 'white',
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '25mm',
                        color: 'black',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                        transform: 'scale(0.9)',
                        transformOrigin: 'top center',
                        fontFamily: 'serif'
                    }}
                >
                    {/* Header */}
                    <div style={{ borderBottom: `2px solid ${template === 'modern' ? '#8b5cf6' : '#333'}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2rem', margin: 0, color: template === 'modern' ? '#8b5cf6' : '#000' }}>{data.sender.fullName || 'Your Name'}</h1>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                            {data.sender.email} | {data.sender.phone}
                            {data.sender.address && ` | ${data.sender.address}`}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Date:</strong> {new Date().toLocaleDateString()}
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <div>{data.recipient.name}</div>
                            <div>{data.recipient.title}</div>
                            <div>{data.recipient.company}</div>
                            <div>{data.recipient.address}</div>
                        </div>
                        <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                            RE: {data.content.subject}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            {data.content.greeting}
                        </div>
                        <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
                            {data.content.body}
                        </div>
                        <div>
                            {data.content.closing}
                            <br /><br />
                            {data.sender.fullName}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
