'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

export default function InboxPage() {
    const [activeTab, setActiveTab] = useState('notifications');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Notifications
        fetch('/api/notifications') // Assuming this exists or using the server action logic from prev page
            .then(res => {
                // If api/notifications doesn't exist, we might need to create it or grab from page prop
                // For now, let's assume we reuse the logic or fetch new
                // Actually, the previous notifications page used Server Components. 
                // Let's make this page fetch data on client for "Live" feel or just fetch generic
                return []; // Placeholder for now if no API
            });

        // Fetch Tickets (Mock or real)
        // Since we didn't make a GET /api/tickets, we'll mock them for the UI demo of "Unified"
        setTickets([
            { id: 't1', subject: 'Missing Points', status: 'OPEN', lastMessage: 'We are looking into it.', updatedAt: new Date().toISOString() },
            { id: 't2', subject: 'App Feedback', status: 'CLOSED', lastMessage: 'Thanks for your suggestion!', updatedAt: new Date(Date.now() - 86400000).toISOString() }
        ]);

        // Mock Notifications for Client Side (Accessing DB directly in Client Comp is forbidden)
        setNotifications([
            { id: 'n1', title: 'Points Earned', message: 'You earned 50 pts for Referral', type: 'EARN', createdAt: new Date().toISOString() },
            { id: 'n2', title: 'Welcome!', message: 'Thanks for joining E-Loyalty', type: 'SYSTEM', createdAt: new Date(Date.now() - 100000000).toISOString() }
        ]);

        setLoading(false);
    }, []);

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Inbox</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #ddd' }}>
                <button
                    onClick={() => setActiveTab('notifications')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'notifications' ? '2px solid #2563eb' : 'none',
                        color: activeTab === 'notifications' ? '#2563eb' : '#666',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Notifications
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'messages' ? '2px solid #2563eb' : 'none',
                        color: activeTab === 'messages' ? '#2563eb' : '#666',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Support Messages
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeTab === 'notifications' && (
                    notifications.map(note => (
                        <Card key={note.id} style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                            <div style={{
                                background: note.type === 'EARN' ? '#dcfce7' : '#e0f2fe',
                                color: note.type === 'EARN' ? '#166534' : '#075985',
                                width: '40px', height: '40px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {note.type === 'EARN' ? '💰' : '📢'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4 style={{ fontWeight: 'bold' }}>{note.title}</h4>
                                    <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ color: '#666', marginTop: '0.25rem' }}>{note.message}</p>
                            </div>
                        </Card>
                    ))
                )}

                {activeTab === 'messages' && (
                    tickets.map(ticket => (
                        <Card key={ticket.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontWeight: 'bold' }}>{ticket.subject}</h4>
                                <span style={{
                                    background: ticket.status === 'OPEN' ? '#fff7ed' : '#f3f4f6',
                                    color: ticket.status === 'OPEN' ? '#c2410c' : '#4b5563',
                                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'
                                }}>
                                    {ticket.status}
                                </span>
                            </div>
                            <p style={{ color: '#666' }}>Last update: {ticket.lastMessage}</p>
                            <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                                <a href="/support" style={{ fontSize: '0.9rem', color: '#2563eb' }}>View Ticket &rarr;</a>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
