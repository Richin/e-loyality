import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Card } from '@/components/ui/Card';

export default async function NotificationsPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return redirect('/auth/signin');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberProfile: {
                include: {
                    notifications: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    if (!user || !user.memberProfile) return <div>Profile not found</div>;

    const notifications = user.memberProfile.notifications;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Notifications</h1>

            {notifications.length === 0 ? (
                <Card><p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No notifications yet.</p></Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {notifications.map(note => (
                        <Card key={note.id} style={{
                            borderLeft: note.isRead ? 'none' : '4px solid #2563eb',
                            background: note.isRead ? '#fff' : '#f0f9ff'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div style={{ fontWeight: 'bold' }}>{note.title}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(note.createdAt).toLocaleDateString()}</div>
                            </div>
                            <p style={{ color: '#444' }}>{note.message}</p>
                            <div style={{ marginTop: '0.5rem' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 6px',
                                    background: '#eee',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    color: '#666'
                                }}>
                                    {note.type}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
