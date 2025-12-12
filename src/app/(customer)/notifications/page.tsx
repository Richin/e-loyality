'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

interface Notification {
    id: string;
    title: string;
    message: string;
    date: string;
    type: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/notifications')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setNotifications(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Inbox</h1>

            {loading ? (
                <p>Loading messages...</p>
            ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <p>No new notifications.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {notifications.map((notif) => (
                        <div key={notif.id} style={{
                            background: '#fff',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            borderLeft: `4px solid ${notif.type === 'EMAIL' ? '#007bff' : '#28a745'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    color: notif.type === 'EMAIL' ? '#007bff' : '#28a745'
                                }}>
                                    {notif.type}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: '#999' }}>
                                    {new Date(notif.date).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{notif.title}</h3>
                            <p style={{ margin: 0, color: '#555', lineHeight: '1.5' }}>{notif.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
