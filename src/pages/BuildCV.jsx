import React, { useState, useRef } from 'react';
import {
    FileText, User, Briefcase, GraduationCap, Zap, BookOpen, Award, ArrowRight, CheckCircle, Download, File
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

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
            {step === 'choice' && <ChoiceStep onNext={() => setStep('wizard')} />}
            {step === 'wizard' && <WizardStep data={cvData} setData={setCvData} onNext={() => setStep('template')} />}
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
    const templates = [
        { id: 'academic', name: 'Academic', color: '#2563eb' },
        { id: 'classic', name: 'Classic', color: '#475569' }
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '3rem' }}>Choose CV Style</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {templates.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onNext(template.id)}
                        className="glass hover-scale"
                        style={{ padding: '2rem', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'inherit' }}
                    >
                        <div style={{ height: '300px', background: 'rgba(255,255,255,0.9)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${template.color}` }}>
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

        let heightLeft = pdfHeight;
        let position = 0;

        // Simple page break logic for long CVs
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

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: 'calc(100vh - 100px)' }}>
            <div className="glass" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Editor</h2>
                <button onClick={handleDownloadPDF} style={{ width: '100%', background: '#ef4444', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', marginBottom: '1rem' }}>Download PDF</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input label="Quick Edit: Full Name" value={data.personal.fullName} onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, fullName: e.target.value } }))} />
                </div>
            </div>

            <div style={{ background: '#525252', borderRadius: '8px', padding: '2rem', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
                <div
                    ref={previewRef}
                    style={{
                        background: 'white',
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '20mm',
                        color: 'black',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                        transform: 'scale(0.9)',
                        transformOrigin: 'top center',
                        fontFamily: template === 'academic' ? 'Times New Roman, serif' : 'Arial, sans-serif'
                    }}
                >
                    <div style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{data.personal.fullName}</h1>
                        <p style={{ margin: '0.5rem 0' }}>{data.personal.title}</p>
                        <p style={{ fontSize: '0.9rem' }}>{data.personal.email} • {data.personal.phone}</p>
                    </div>

                    {data.personal.summary && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>SUMMARY</h3>
                            <p>{data.personal.summary}</p>
                        </div>
                    )}

                    {data.education.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>EDUCATION</h3>
                            {data.education.map((edu, i) => (
                                <div key={i} style={{ marginBottom: '0.5rem' }}>
                                    <strong>{edu.school}</strong>, {edu.year}
                                    <div>{edu.degree}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.publications.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>PUBLICATIONS</h3>
                            {data.publications.map((pub, i) => (
                                <div key={i} style={{ marginBottom: '0.5rem' }}>
                                    <em>"{pub.title}"</em>. {pub.journal} ({pub.year}).
                                </div>
                            ))}
                        </div>
                    )}

                    {data.experience.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>PROFESSIONAL EXPERIENCE</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{exp.role}</strong>
                                        <span>{exp.duration}</span>
                                    </div>
                                    <div>{exp.company}</div>
                                    <p style={{ fontSize: '0.95rem' }}>{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.awards.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>AWARDS</h3>
                            {data.awards.map((award, i) => (
                                <div key={i} style={{ marginBottom: '0.25rem' }}>
                                    {award.name} ({award.date})
                                </div>
                            ))}
                        </div>
                    )}

                    {data.skills && (
                        <div>
                            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>SKILLS</h3>
                            <p>{data.skills}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
