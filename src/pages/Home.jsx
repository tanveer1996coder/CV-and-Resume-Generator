import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Zap, Layout, CheckCircle, Star } from 'lucide-react';

export default function Home() {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            {/* Hero Section */}
            <div className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '1.5rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
                    Build Your Future, Fast.
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.7' }}>
                    Create professional resumes, cover letters, and CVs in minutes with our AI-powered builder. Stand out from the crowd with premium designs.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/build-resume" style={{ textDecoration: 'none', background: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', transition: 'transform 0.2s', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }} className="hover-scale">
                        Build Resume <ArrowRight size={20} />
                    </Link>
                    <Link to="/build-cv" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', backdropFilter: 'blur(10px)' }}>
                        Build CV
                    </Link>
                    <Link to="/build-cover-letter" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', backdropFilter: 'blur(10px)' }}>
                        Cover Letter
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                <FeatureCard
                    icon={<Zap size={32} color="#ec4899" />}
                    title="AI-Powered Optimization"
                    description="Get smart suggestions to enhance your resume content and beat the ATS systems with ease."
                />
                <FeatureCard
                    icon={<Layout size={32} color="#8b5cf6" />}
                    title="Real-Time Editor"
                    description="See changes instantly as you type. Drag and drop sections to customize your layout perfectly."
                />
                <FeatureCard
                    icon={<FileText size={32} color="#3b82f6" />}
                    title="Multiple Formats"
                    description="Export your documents in PDF, DOCX, TXT, or JPG formats anytime, anywhere."
                />
            </div>

            {/* Testimonials */}
            <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Trusted by Professionals</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    <TestimonialCard
                        name="Alex Morgan"
                        role="Software Engineer"
                        text="This builder helped me land my dream job at a top tech company. The AI suggestions were a game changer!"
                    />
                    <TestimonialCard
                        name="Sarah Jenkins"
                        role="Marketing Director"
                        text="The designs are absolutely stunning. I received so many compliments on my resume's layout."
                    />
                    <TestimonialCard
                        name="David Chen"
                        role="Product Manager"
                        text="Fast, easy, and effective. The real-time preview saved me hours of formatting headaches."
                    />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="glass" style={{ padding: '2rem', transition: 'transform 0.2s' }}>
            <div style={{ marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{description}</p>
        </div>
    );
}

function TestimonialCard({ name, role, text }) {
    return (
        <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />)}
            </div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>"{text}"</p>
            <div>
                <div style={{ fontWeight: 'bold' }}>{name}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{role}</div>
            </div>
        </div>
    );
}
