import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Blog() {
    const posts = [
        {
            id: 1,
            title: "Top 10 Resume Mistakes to Avoid in 2025",
            excerpt: "Learn what recruiters are looking for and what instantly disqualifies your application.",
            date: "Dec 12, 2025",
            category: "Career Advice"
        },
        {
            id: 2,
            title: "How to Write a Compelling Cover Letter",
            excerpt: "Stand out from the competition with a cover letter that tells your unique story.",
            date: "Dec 10, 2025",
            category: "Guides"
        },
        {
            id: 3,
            title: "CV vs. Resume: What's the Difference?",
            excerpt: "Understanding when to use a Curriculum Vitae and when to stick to a one-page resume.",
            date: "Dec 08, 2025",
            category: "Education"
        }
    ];

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Career Insights</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Latest tips and guides for your job search.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {posts.map(post => (
                    <div key={post.id} className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {post.category}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{post.date}</span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', lineHeight: '1.4' }}>{post.title}</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem', flexGrow: 1, lineHeight: '1.6' }}>{post.excerpt}</p>
                        <button style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: 0,
                            fontSize: '1rem'
                        }}>
                            Read Article <ArrowRight size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
