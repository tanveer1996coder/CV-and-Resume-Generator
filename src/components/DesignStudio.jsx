import React, { useState } from 'react';
import { Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { colorThemes, fontPairings, layouts } from '../utils/templates';

export default function DesignStudio({ onNext, initialConfig }) {
    const [config, setConfig] = useState(initialConfig || {
        layout: 'modern',
        theme: 'slate',
        font: 'inter'
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', minHeight: '80vh' }}>
            {/* Left Sidebar - Design Controls */}
            <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', height: 'fit-content' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={20} color="var(--primary)" /> Design Studio
                </h2>

                {/* Layout Selection */}
                <section>
                    <label style={{ display: 'block', marginBottom: '1rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>LAYOUT STRUCTURE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                        {layouts.map(l => (
                            <button
                                key={l.id}
                                onClick={() => setConfig(prev => ({ ...prev, layout: l.id }))}
                                style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    background: config.layout === l.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: config.layout === l.id ? 'none' : '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: config.layout === l.id ? 'bold' : 'normal',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                {l.name}
                                {config.layout === l.id && <CheckCircle size={16} />}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Color Theme Selection */}
                <section>
                    <label style={{ display: 'block', marginBottom: '1rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>COLOR PALETTE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                        {Object.entries(colorThemes).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => setConfig(prev => ({ ...prev, theme: key }))}
                                title={key}
                                style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    borderRadius: '50%',
                                    background: value.primary,
                                    border: config.theme === key ? '3px solid white' : '2px solid transparent',
                                    cursor: 'pointer',
                                    boxShadow: config.theme === key ? '0 0 0 2px var(--primary)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </div>
                </section>

                {/* Font Selection */}
                <section>
                    <label style={{ display: 'block', marginBottom: '1rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>TYPOGRAPHY</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        {Object.entries(fontPairings).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => setConfig(prev => ({ ...prev, font: key }))}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    background: config.font === key ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontFamily: value.header.replace(/"/g, ''),
                                    fontSize: '1rem'
                                }}
                            >
                                Aa • {key.charAt(0).toUpperCase() + key.slice(1)}
                            </button>
                        ))}
                    </div>
                </section>

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={() => onNext(config)}
                        className="glass"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Use This Design <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* Right Preview Area */}
            <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{
                    width: '380px',
                    height: '540px',
                    background: 'white',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    fontFamily: fontPairings[config.font].body.replace(/"/g, ''),
                    borderRadius: '4px'
                }}>
                    {/* Header Mockup */}
                    <div style={{
                        height: config.layout === 'creative' ? '150px' : '80px',
                        background: config.layout === 'minimal' ? 'white' : colorThemes[config.theme].primary,
                        color: config.layout === 'minimal' ? 'black' : 'white',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        borderBottom: config.layout === 'minimal' ? `2px solid ${colorThemes[config.theme].primary}` : 'none'
                    }}>
                        <div style={{ width: '60%', height: '12px', background: 'currentColor', opacity: 0.9, marginBottom: '8px', borderRadius: '2px' }}></div>
                        <div style={{ width: '40%', height: '8px', background: 'currentColor', opacity: 0.7, borderRadius: '2px' }}></div>
                    </div>

                    <div style={{ flex: 1, display: 'flex' }}>
                        {/* Sidebar Mockup (if applicable) */}
                        {(config.layout === 'modern' || config.layout === 'executive') && (
                            <div style={{
                                width: '30%',
                                background: config.layout === 'modern' ? colorThemes[config.theme].secondary : '#f1f5f9',
                                padding: '1rem'
                            }}>
                                <div style={{ width: '80%', height: '8px', background: 'rgba(0,0,0,0.1)', marginBottom: '20px' }}></div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', marginBottom: '8px' }}></div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', marginBottom: '8px' }}></div>
                            </div>
                        )}

                        {/* Main Body Mockup */}
                        <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i}>
                                    <div style={{ width: '30%', height: '10px', background: colorThemes[config.theme].primary, marginBottom: '8px', opacity: 0.8 }}></div>
                                    <div style={{ width: '100%', height: '6px', background: '#cbd5e1', marginBottom: '4px' }}></div>
                                    <div style={{ width: '90%', height: '6px', background: '#cbd5e1', marginBottom: '4px' }}></div>
                                    <div style={{ width: '40%', height: '6px', background: '#cbd5e1', marginBottom: '4px' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
