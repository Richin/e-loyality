'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Mock Data (in real app, fetch from API)
const FAQS = [
    { id: '1', question: 'How do I earn points?', answer: 'You earn points for every purchase at our store or online. $1 spend = 1 point.' },
    { id: '2', question: 'When do my points expire?', answer: 'Points expire 12 months after they are earned if there is no account activity.' },
    { id: '3', question: 'How can I redeem rewards?', answer: 'Go to the Rewards page, browse the catalog, and click Redeem on your desired item.' }
];

export default function SupportPage() {
    const [faqOpen, setFaqOpen] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ sender: string, text: string }[]>([
        { sender: 'bot', text: 'Hi! How can I help you today?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);

    const toggleFaq = (id: string) => setFaqOpen(faqOpen === id ? null : id);

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setChatInput('');

        // Simple mock response
        setTimeout(() => {
            let botResponse = "I'm not sure about that. Please contact support.";
            if (userMsg.toLowerCase().includes('point')) botResponse = "You can earn points by shopping! Check the 'Earn' section.";
            if (userMsg.toLowerCase().includes('redeem')) botResponse = "Redeem your points in the Rewards Catalog.";

            setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        }, 1000);
    };

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your feedback!');
        setFeedback('');
        setRating(5);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', position: 'relative' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem' }}>Support & Feedback</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* FAQ Section */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {FAQS.map(faq => (
                            <Card key={faq.id} style={{ cursor: 'pointer' }} onClick={() => toggleFaq(faq.id)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '500' }}>
                                    {faq.question}
                                    <span>{faqOpen === faq.id ? '−' : '+'}</span>
                                </div>
                                {faqOpen === faq.id && (
                                    <div style={{ marginTop: '0.5rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                                        {faq.answer}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Feedback Section */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Send Feedback</h2>
                    <Card>
                        <form onSubmit={handleFeedbackSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Rate your experience</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRating(r)}
                                            style={{
                                                fontSize: '1.5rem',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                opacity: r <= rating ? 1 : 0.3
                                            }}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Message</label>
                                <textarea
                                    className="input"
                                    rows={4}
                                    style={{ width: '100%', padding: '0.5rem' }}
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us what you think..."
                                    required
                                />
                            </div>
                            <Button type="submit" fullWidth>Submit Feedback</Button>
                        </form>
                    </Card>
                </div>
            </div>

            {/* Chatbot Floating Button */}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
                {!chatOpen && (
                    <button
                        onClick={() => setChatOpen(true)}
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                        }}
                    >
                        💬
                    </button>
                )}

                {chatOpen && (
                    <div style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '350px',
                        height: '450px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1rem', background: '#2563eb', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>Support Assistant</span>
                            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {chatMessages.map((msg, i) => (
                                <div key={i} style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    background: msg.sender === 'user' ? '#eff6ff' : '#f3f4f6',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    maxWidth: '80%'
                                }}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleChatSubmit} style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem' }}>
                            <Input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type a message..."
                                style={{ flex: 1 }}
                            />
                            <Button type="submit" size="sm">Send</Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
