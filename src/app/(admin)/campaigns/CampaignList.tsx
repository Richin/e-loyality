'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './campaigns.module.css';
import { useRouter } from 'next/navigation';

interface Campaign {
    id: string;
    name: string;
    type: string;
    status: string;
    sentAt: string | null;
    createdAt: string;
}

export default function CampaignList({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    const [sending, setSending] = useState<string | null>(null);
    const router = useRouter();

    const handleSend = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to send campaign "${name}"?`)) return;

        setSending(id);
        try {
            const res = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to send');

            const updated = await res.json();

            // Update local state to reflect change immediately
            setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'SENT', sentAt: new Date().toISOString() } : c));
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error sending campaign');
        } finally {
            setSending(null);
        }
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {campaigns.map((c) => (
                        <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>{c.type}</td>
                            <td>
                                <span className={c.status === 'SENT' ? styles.statusSent : styles.statusDraft}>
                                    {c.status}
                                </span>
                            </td>
                            <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td>
                                {c.status === 'DRAFT' && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleSend(c.id, c.name)}
                                        disabled={sending === c.id}
                                    >
                                        {sending === c.id ? 'Sending...' : 'Send Now'}
                                    </Button>
                                )}
                                {c.status === 'SENT' && (
                                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                        Sent on {new Date(c.sentAt!).toLocaleDateString()}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {campaigns.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                                No campaigns found. Create one to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
