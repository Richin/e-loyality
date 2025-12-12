'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function FeedbackPage() {
    const [formData, setFormData] = useState({
        category: 'Service',
        rating: '5',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccess(true);
                setFormData({ category: 'Service', rating: '5', message: '' });
            }
        } catch (error) {
            alert('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
                <Card title="Thank You!">
                    <div style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h2>Feedback Received</h2>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>Your feedback helps us improve our service.</p>
                        <Button onClick={() => setSuccess(false)}>Submit Another</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ marginBottom: '1rem' }}>Feedback & Surveys</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Tell us about your experience.</p>

            <Card title="Share your thoughts">
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
                        <select
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '6px',
                                border: '1px solid #ccc', fontSize: '1rem'
                            }}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Service">Customer Service</option>
                            <option value="App">App Experience</option>
                            <option value="Product">Product Quality</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Rating</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <label key={star} style={{ cursor: 'pointer', fontSize: '1.5rem' }}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={star}
                                        checked={Number(formData.rating) === star}
                                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                        style={{ marginRight: '5px' }}
                                    />
                                    {star}⭐
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Message</label>
                        <textarea
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '6px',
                                border: '1px solid #ccc', fontSize: '1rem', minHeight: '120px',
                                fontFamily: 'inherit'
                            }}
                            placeholder="Share your details here..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" fullWidth disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
