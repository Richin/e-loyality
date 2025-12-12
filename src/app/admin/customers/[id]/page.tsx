'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const { id } = resolvedParams;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Action States
    const [adjustPoints, setAdjustPoints] = useState(0);
    const [mergeTargetId, setMergeTargetId] = useState('');
    const [reason, setReason] = useState('');

    const router = useRouter();

    const fetchDetails = () => {
        setLoading(true);
        fetch(`/api/admin/customers/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) alert(data.error);
                else setData(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchDetails();
    }, []);

    const handleAction = async (action: string, payload: any) => {
        if (!confirm('Are you sure you want to perform this action?')) return;

        const res = await fetch('/api/admin/customers/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                targetProfileId: id,
                ...payload
            })
        });
        const result = await res.json();
        if (result.success) {
            alert('Success');
            fetchDetails(); // Refresh
        } else {
            alert('Error: ' + result.error);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading CRM...</div>;
    if (!data) return <div style={{ padding: '2rem' }}>Customer Not Found</div>;

    const { profile, auditLogs, allTiers } = data;

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{profile.user.name}</h1>
                    <div style={{ color: '#64748b' }}>{profile.user.email} • Joined {new Date(profile.user.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {profile.user.isSuspended ? (
                        <Button style={{ background: '#16a34a' }} onClick={() => handleAction('SUSPEND_USER', { suspend: false })}>Unsuspend User</Button>
                    ) : (
                        <Button style={{ background: '#dc2626' }} onClick={() => handleAction('SUSPEND_USER', { suspend: true })}>Suspend User</Button>
                    )}
                </div>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                {['overview', 'activity', 'audit', 'settings'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'none', border: 'none',
                            borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                            color: activeTab === tab ? '#2563eb' : '#64748b',
                            fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {/* PROFILE EDIT */}
                    <Card title="Customer Profile">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#666' }}>Name</label>
                                <input type="text" defaultValue={profile.user.name} id="editName" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#666' }}>Phone</label>
                                <input type="text" defaultValue={profile.phone} id="editPhone" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#666' }}>Date of Birth</label>
                                <input type="date" defaultValue={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''} id="editDob" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                            <Button onClick={() => {
                                // @ts-ignore
                                const name = document.getElementById('editName').value;
                                // @ts-ignore
                                const phone = document.getElementById('editPhone').value;
                                // @ts-ignore
                                const dob = document.getElementById('editDob').value;
                                handleAction('UPDATE_PROFILE', { name, phone, dateOfBirth: dob });
                            }}>Save Changes</Button>
                        </div>
                    </Card>

                    {/* WALLET MANAGEMENT */}
                    <Card title="Wallet Management">
                        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Points Balance</label>
                            <div style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '0.5rem' }}>{profile.pointsBalance.toLocaleString()}</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input type="number" placeholder="+/-" className="p-2 border rounded" style={{ width: '80px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} onChange={e => setAdjustPoints(parseInt(e.target.value))} />
                                <input type="text" placeholder="Reason" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }} onChange={e => setReason(e.target.value)} />
                                <Button size="sm" onClick={() => handleAction('ADJUST_POINTS', { amount: adjustPoints, reason })}>Update</Button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                            {/* CASHBACK */}
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Cashback</label>
                                <div style={{ fontSize: '1.25rem', color: '#16a34a', marginBottom: '0.5rem' }}>${profile.cashbackBalance.toFixed(2)}</div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <input type="number" id="adjCashback" placeholder="+/-" style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    <Button size="sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => {
                                        // @ts-ignore
                                        const amt = parseFloat(document.getElementById('adjCashback').value);
                                        handleAction('ADJUST_WALLET', { type: 'CASHBACK', amount: amt });
                                    }}>Go</Button>
                                </div>
                            </div>

                            {/* PREPAID */}
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Prepaid</label>
                                <div style={{ fontSize: '1.25rem', color: '#9333ea', marginBottom: '0.5rem' }}>${profile.prepaidBalance.toFixed(2)}</div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <input type="number" id="adjPrepaid" placeholder="+/-" style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    <Button size="sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => {
                                        // @ts-ignore
                                        const amt = parseFloat(document.getElementById('adjPrepaid').value);
                                        handleAction('ADJUST_WALLET', { type: 'PREPAID', amount: amt });
                                    }}>Go</Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Tier Management">
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Current Tier</label>
                            <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{profile.tier?.name || 'None'}</div>

                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Force Override Tier</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    id="tierSelect"
                                    style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
                                >
                                    {allTiers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <Button size="sm" onClick={() => {
                                    // @ts-ignore
                                    const val = document.getElementById('tierSelect').value;
                                    handleAction('FORCE_TIER', { tierId: val });
                                }}>Update</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <Card title="Transaction History">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                                    <th style={{ padding: '0.5rem' }}>Date</th>
                                    <th style={{ padding: '0.5rem' }}>Type</th>
                                    <th style={{ padding: '0.5rem' }}>Description</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profile.transactions.map((t: any) => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{t.type}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{t.description}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: t.points > 0 ? 'green' : 'red' }}>
                                            {t.points > 0 ? '+' : ''}{t.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                    <Card title="Redeemed Rewards">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                                    <th style={{ padding: '0.5rem' }}>Date</th>
                                    <th style={{ padding: '0.5rem' }}>Reward</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profile.redemptions.map((r: any) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{new Date(r.redeemedAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{r.reward?.name || 'Unknown Reward'}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{r.pointsCost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}

            {activeTab === 'audit' && (
                <Card title="Admin Audit Logs">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                                <th style={{ padding: '0.5rem' }}>Date</th>
                                <th style={{ padding: '0.5rem' }}>Admin</th>
                                <th style={{ padding: '0.5rem' }}>Action</th>
                                <th style={{ padding: '0.5rem' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>No admin actions recorded.</td></tr>}
                            {auditLogs.map((log: any) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{log.admin?.name || 'System'}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{log.action}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: '#666' }}>{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {activeTab === 'settings' && (
                <Card title="Danger Zone" style={{ border: '1px solid #ef4444' }}>
                    <div style={{ padding: '1rem', background: '#fef2f2' }}>
                        <h3 style={{ color: '#b91c1c', fontWeight: 'bold', marginBottom: '1rem' }}>Merge Accounts</h3>
                        <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Transfer all points and history FROM another account TO this one. The source account will be deleted.
                            <br /><strong>This cannot be undone.</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Source Profile ID (The Duplicate)"
                                style={{ padding: '0.5rem', border: '1px solid #f87171', borderRadius: '4px', flex: 1 }}
                                onChange={e => setMergeTargetId(e.target.value)}
                            />
                            <Button style={{ background: '#dc2626' }} onClick={() => handleAction('MERGE_ACCOUNTS', { sourceProfileId: mergeTargetId })}>Merge & Delete Source</Button>
                        </div>
                    </div>
                </Card>
            )}

        </div>
    );
}
