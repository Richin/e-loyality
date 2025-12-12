'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RedemptionsPage() {
    const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | HISTORY
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        setLoading(true);
        try {
            // If tab is pending, fetch pending. If history, fetch all (or ignore status filter)
            let url = `/api/admin/redemptions`;
            if (activeTab === 'PENDING') url += `?status=PENDING`;

            const res = await fetch(url);
            setItems(await res.json());
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`${action} this redemption?`)) return;

        try {
            const res = await fetch('/api/admin/redemptions', {
                method: 'POST',
                body: JSON.stringify({ id, action })
            });
            const data = await res.json();
            if (data.success) {
                alert(action === 'APPROVE' ? `Approved! Code: ${data.code}` : 'Rejected and Refunded.');
                fetchItems();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Error processing request');
        }
    };

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Redemption Console</h1>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <button onClick={() => setActiveTab('PENDING')} style={{
                    padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                    borderBottom: activeTab === 'PENDING' ? '2px solid #2563eb' : 'none',
                    color: activeTab === 'PENDING' ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer'
                }}>
                    Needs Approval
                </button>
                <button onClick={() => setActiveTab('HISTORY')} style={{
                    padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                    borderBottom: activeTab === 'HISTORY' ? '2px solid #2563eb' : 'none',
                    color: activeTab === 'HISTORY' ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer'
                }}>
                    Redemption History
                </button>
            </div>

            {loading ? <div>Loading...</div> : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {items.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No items found.</div>}

                    {items.map((item: any) => (
                        <Card key={item.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {/* Status Badge */}
                                    <div style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                        background: item.status === 'PENDING' ? '#fff7ed' : (item.status === 'APPROVED' ? '#dcfce7' : '#f1f5f9'),
                                        color: item.status === 'PENDING' ? '#c2410c' : (item.status === 'APPROVED' ? '#166534' : '#475569')
                                    }}>
                                        {item.status}
                                    </div>

                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.reward.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                            by <strong>{item.memberProfile.user.name}</strong> ({item.memberProfile.user.email})
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: '#dc2626' }}>-{item.reward.pointsCost} pts</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(item.redeemedAt).toLocaleString()}</div>
                                </div>

                                {item.status === 'PENDING' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button size="sm" onClick={() => handleAction(item.id, 'APPROVE')}>Approve</Button>
                                        <Button size="sm" style={{ background: '#dc2626' }} onClick={() => handleAction(item.id, 'REJECT')}>Reject</Button>
                                    </div>
                                )}

                                {item.status === 'APPROVED' && item.code && (
                                    <div style={{ background: '#f8fafc', padding: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '4px', fontFamily: 'monospace' }}>
                                        CODE: {item.code}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
