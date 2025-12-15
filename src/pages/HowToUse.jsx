import React from 'react';
import { ClipboardList, PenTool, Download } from 'lucide-react';

export default function HowToUse() {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '3rem', textAlign: 'center' }}>How It Works</h1>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Step
                    number="1"
                    title="Choose Your Path"
                    description="Select whether you want to build a Resume, CV, or Cover Letter. You can start from scratch or upload an existing file to edit."
                    icon={<ClipboardList size={24} />}
                />
                <div style={{ height: '40px', borderLeft: '2px dashed var(--glass-border)', margin: '0 2.5rem' }}></div>
                <Step
                    number="2"
                    title="Enter Your Details"
                    description="Fill in your personal information, experience, and education. Our smart wizard guides you through each section."
                    icon={<PenTool size={24} />}
                />
                <div style={{ height: '40px', borderLeft: '2px dashed var(--glass-border)', margin: '0 2.5rem' }}></div>
                <Step
                    number="3"
                    title="Customize & Download"
                    description="Choose a premium template, drag-and-drop sections to perfect the layout, and download your document in your preferred format."
                    icon={<Download size={24} />}
                />
            </div>
        </div>
    );
}

function Step({ number, title, description, icon }) {
    return (
        <div className="glass" style={{ display: 'flex', gap: '1.5rem', padding: '2rem', alignItems: 'flex-start' }}>
            <div style={{
                background: 'var(--primary)',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                flexShrink: 0
            }}>
                {number}
            </div>
            <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {title}
                </h3>
                <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{description}</p>
            </div>
        </div>
    );
}
