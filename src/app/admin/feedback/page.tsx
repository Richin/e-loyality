'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

export default function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/feedback')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setFeedbacks(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>User Feedback</h1>

            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {feedbacks.map(f => (
                        <div key={f.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>{f.category}</span>
                                <span style={{ color: '#f1c40f' }}>{'⭐'.repeat(f.rating)}</span>
                            </div>
                            <p style={{ margin: '0 0 1rem 0', lineHeight: '1.5' }}>{f.message}</p>
                            <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                {new Date(f.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
