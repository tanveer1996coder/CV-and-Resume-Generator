import React from 'react';
import { colorThemes, fontPairings } from '../utils/templates';

export default function ResumeRenderer({ data, template, sectionOrder, isCoverLetter = false }) {
    // Safety check for legacy string templates or missing config
    const safeTemplate = typeof template === 'string'
        ? { layout: 'modern', theme: 'slate', font: 'inter' }
        : (template || { layout: 'modern', theme: 'slate', font: 'inter' });

    const { layout, theme, font } = safeTemplate;

    // Get theme values with fallbacks
    const activeTheme = colorThemes[theme] || colorThemes.slate;
    const activeFont = fontPairings[font] || fontPairings.inter;

    const styles = {
        container: {
            fontFamily: activeFont.body.replace(/"/g, ''),
            color: activeTheme.secondary, // Body text color
            height: '100%',
            display: 'flex',
            flexDirection: layout === 'modern' || layout === 'executive' ? 'row' : 'column'
        },
        header: {
            background: layout === 'minimal' ? 'white' : activeTheme.primary,
            color: layout === 'minimal' ? activeTheme.primary : 'white',
            padding: '2rem',
            textAlign: layout === 'creative' ? 'center' : 'left',
            borderBottom: layout === 'minimal' ? `2px solid ${activeTheme.primary}` : 'none'
        },
        sidebar: {
            width: '30%',
            background: activeTheme.accent,
            padding: '1.5rem',
            color: '#334155',
            display: (layout === 'modern' || layout === 'executive') ? 'block' : 'none'
        },
        main: {
            flex: 1,
            padding: '2rem',
            background: 'white'
        },
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: activeTheme.primary,
            borderBottom: `2px solid ${activeTheme.accent}`,
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        }
    };

    // --- Cover Letter Rendering ---
    if (isCoverLetter) {
        return (
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, fontFamily: activeFont.header.replace(/"/g, '') }}>{data.sender.fullName}</h1>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.9, flexWrap: 'wrap', justifyContent: layout === 'creative' ? 'center' : 'flex-start' }}>
                        <span>{data.sender.email}</span>
                        <span>{data.sender.phone}</span>
                        {data.sender.address && <span>{data.sender.address}</span>}
                    </div>
                </header>
                <main style={styles.main}>
                    <div style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
                        <strong>Date:</strong> {new Date().toLocaleDateString()}
                    </div>
                    <div style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
                        <div>{data.recipient.name}</div>
                        <div>{data.recipient.title}</div>
                        <div>{data.recipient.company}</div>
                        <div>{data.recipient.address}</div>
                    </div>
                    <div style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1rem' }}>
                        RE: {data.content.subject}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        {data.content.greeting}
                    </div>
                    <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
                        {data.content.body}
                    </div>
                    <div>
                        {data.content.closing}
                        <br /><br />
                        {data.sender.fullName}
                    </div>
                </main>
            </div>
        );
    }

    // --- Resume / CV Rendering ---

    // Helper to render a section
    const renderSection = (id) => {
        switch (id) {
            case 'summary':
                return data.personal?.summary && (
                    <div key="summary" style={{ marginBottom: '2rem' }}>
                        <h3 style={styles.sectionTitle}>Professional Summary</h3>
                        <p style={{ lineHeight: '1.6', color: '#334155' }}>{data.personal.summary}</p>
                    </div>
                );
            case 'experience':
                return data.experience?.length > 0 && (
                    <div key="experience" style={{ marginBottom: '2rem' }}>
                        <h3 style={styles.sectionTitle}>Experience</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>{exp.role}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{exp.start} - {exp.end}</div>
                                </div>
                                <div style={{ fontWeight: '500', color: activeTheme.primary, marginBottom: '0.5rem' }}>{exp.company}</div>
                                <p style={{ lineHeight: '1.5', color: '#475569', whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'education':
                return data.education?.length > 0 && (
                    <div key="education" style={{ marginBottom: '2rem' }}>
                        <h3 style={styles.sectionTitle}>Education</h3>
                        {data.education.map((edu, i) => (
                            <div key={i} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: 'bold' }}>{edu.school}</div>
                                    <div style={{ color: '#64748b' }}>{edu.year}</div>
                                </div>
                                <div style={{ color: '#475569' }}>{edu.degree} in {edu.field}</div>
                            </div>
                        ))}
                    </div>
                );
            case 'skills':
                return data.skills && (
                    <div key="skills" style={{ marginBottom: '2rem' }}>
                        <h3 style={styles.sectionTitle}>Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {data.skills.split(',').map((skill, i) => (
                                <span key={i} style={{ background: activeTheme.accent, padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            // CV Specific Sections:
            case 'publications':
                return data.publications?.length > 0 && (
                    <div key="publications" style={{ marginBottom: '2rem' }}>
                        <h3 style={styles.sectionTitle}>Publications</h3>
                        {data.publications.map((pub, i) => (
                            <div key={i} style={{ marginBottom: '1rem', paddingLeft: '1rem', borderLeft: `2px solid ${activeTheme.accent}` }}>
                                <div style={{ fontStyle: 'italic', fontWeight: '500' }}>{pub.title}</div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{pub.publisher} | {pub.year}</div>
                            </div>
                        ))}
                    </div>
                );
            case 'awards':
                return data.awards?.length > 0 && (
                    <div key="awards" style={{ marginBottom: '2rem' }}>
                        <h3 style={styles.sectionTitle}>Awards & Certifications</h3>
                        {data.awards.map((award, i) => (
                            <div key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: activeTheme.primary }}>•</span>
                                <span>{award.name} ({award.year})</span> - <span style={{ color: '#64748b' }}>{award.issuer}</span>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    // Layout Logic
    if (layout === 'modern' || layout === 'executive') {
        // Two Column Layout
        return (
            <div style={styles.container}>
                <aside style={styles.sidebar}>
                    {/* Sidebar Content: Contact, Skills */}
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        {/* Initials Avatar */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: activeTheme.primary,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            margin: '0 auto 1rem auto'
                        }}>
                            {data.personal?.fullName ? data.personal.fullName.charAt(0) : 'Me'}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: activeTheme.primary, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Contact</h4>
                        <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div>{data.personal?.email}</div>
                            <div>{data.personal?.phone}</div>
                        </div>
                    </div>

                    {/* Render Skills in Sidebar for Modern */}
                    {data.skills && (
                        <div>
                            <h4 style={{ color: activeTheme.primary, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Skills</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <span key={i} style={{ background: 'rgba(255,255,255,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>{skill.trim()}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
                <main style={styles.main}>
                    <header style={{ marginBottom: '2rem', borderBottom: `2px solid ${activeTheme.accent}`, paddingBottom: '1rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: activeTheme.primary, margin: 0 }}>{data.personal?.fullName}</h1>
                        <p style={{ fontSize: '1.2rem', color: activeTheme.secondary, marginTop: '0.5rem' }}>{data.personal?.title}</p>
                    </header>
                    {sectionOrder.map(section => {
                        if (section.id === 'skills') return null; // Handled in sidebar
                        return renderSection(section.id);
                    })}
                </main>
            </div>
        );
    }

    // Default One-Column Layout (Classic, Minimal, Creative)
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, fontFamily: activeFont.header.replace(/"/g, '') }}>{data.personal?.fullName}</h1>
                <p style={{ fontSize: '1.5rem', opacity: 0.9, marginTop: '0.5rem' }}>{data.personal?.title}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8, justifyContent: layout === 'creative' ? 'center' : 'flex-start' }}>
                    <span>{data.personal?.email}</span>
                    <span>•</span>
                    <span>{data.personal?.phone}</span>
                </div>
            </header>
            <main style={styles.main}>
                {/* Draft Watermark */}
                <div className="watermark-draft" data-html2canvas-ignore="true" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    fontSize: '8rem',
                    fontWeight: 'bold',
                    color: 'rgba(0,0,0,0.03)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    DRAFT
                </div>
                {sectionOrder.map(section => renderSection(section.id))}
            </main>
        </div>
    );
}
