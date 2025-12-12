'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState('campaigns');
    const [campaigns, setCampaigns] = useState([]);
    const [segments, setSegments] = useState([]);
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [showCampaignForm, setShowCampaignForm] = useState(false);
    const [showSegmentForm, setShowSegmentForm] = useState(false);
    const [showPromoForm, setShowPromoForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, sRes, pRes] = await Promise.all([
                fetch('/api/admin/campaigns').then(r => r.json()),
                fetch('/api/admin/segments').then(r => r.json()),
                fetch('/api/admin/promocodes').then(r => r.json())
            ]);
            setCampaigns(cRes.error ? [] : cRes);
            setSegments(sRes.error ? [] : sRes);
            setPromos(pRes.error ? [] : pRes);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleSendNow = async (id: string) => {
        if (!confirm('Are you sure you want to blast this campaign now?')) return;
        const res = await fetch('/api/admin/campaigns', {
            method: 'PUT',
            body: JSON.stringify({ id, action: 'SEND_NOW' })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Sent to ${data.count} recipients!`);
            fetchData();
        } else {
            alert(data.error);
        }
    };

    const handleDelete = async (endpoint: string, id: string) => {
        if (!confirm('Delete this item?')) return;
        await fetch(`/api/admin/${endpoint}?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Marketing Data...</div>;

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Marketing & Automation</h1>
                <Button onClick={async () => {
                    if (!confirm('Force run scheduler?')) return;
                    const res = await fetch('/api/cron');
                    const data = await res.json();
                    alert(JSON.stringify(data));
                    fetchData();
                }} style={{ background: '#475569' }}>Run Scheduler (Force)</Button>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                {['campaigns', 'segments', 'promocodes'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                        color: activeTab === tab ? '#2563eb' : '#64748b', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer'
                    }}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* --- CAMPAIGNS TAB --- */}
            {activeTab === 'campaigns' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>All Campaigns</h2>
                        <Button onClick={() => setShowCampaignForm(true)}>+ Create Campaign</Button>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {campaigns.map((c: any) => (
                            <div key={c.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{c.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Type: {c.type} | Status: <span style={{ fontWeight: 'bold', color: c.status === 'SENT' ? 'green' : 'orange' }}>{c.status}</span></div>
                                    <div style={{ fontSize: '0.8rem', color: '#999' }}>Segment: {c.segment?.name || 'None'}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {c.status !== 'SENT' && <Button onClick={() => handleSendNow(c.id)} style={{ background: '#16a34a' }}>🚀 Send Now</Button>}
                                    <Button onClick={() => handleDelete('campaigns', c.id)} style={{ background: '#ef4444' }}>Delete</Button>
                                </div>
                            </div>
                        ))}
                        {campaigns.length === 0 && <div style={{ textAlign: 'center', color: '#888' }}>No campaigns found.</div>}
                    </div>
                </div>
            )}

            {/* --- SEGMENTS TAB --- */}
            {activeTab === 'segments' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Customer Segments</h2>
                        <Button onClick={() => setShowSegmentForm(true)}>+ Create Segment</Button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {segments.map((s: any) => (
                            <Card key={s.id} title={s.name}>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#666', height: '60px', overflowY: 'auto' }}>
                                        Criteria: {s.criteria}
                                    </div>
                                    <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2563eb' }}>{s.memberCount} members</span>
                                        <button onClick={() => handleDelete('segments', s.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* --- PROMO CODES TAB --- */}
            {activeTab === 'promocodes' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Promo Codes</h2>
                        <Button onClick={() => setShowPromoForm(true)}>+ Create Code</Button>
                    </div>

                    <table style={{ width: '100%', background: 'white', borderRadius: '8px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Code</th>
                                <th style={{ padding: '1rem' }}>Type</th>
                                <th style={{ padding: '1rem' }}>Value</th>
                                <th style={{ padding: '1rem' }}>Usage</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promos.map((p: any) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.code}</td>
                                    <td style={{ padding: '1rem' }}>{p.type}</td>
                                    <td style={{ padding: '1rem' }}>{p.value}</td>
                                    <td style={{ padding: '1rem' }}>{p.usedCount} / {p.usageLimit || '∞'}</td>
                                    <td style={{ padding: '1rem' }}>{p.isActive ? 'Active' : 'Inactive'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleDelete('promocodes', p.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- MODALS (Simplified for speed) --- */}
            {/* Create Campaign Modal */}
            {showCampaignForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '500px' }}>
                        <h2>New Campaign</h2>
                        <form onSubmit={(e: any) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            fetch('/api/admin/campaigns', {
                                method: 'POST',
                                body: JSON.stringify(Object.fromEntries(formData)),
                            }).then(() => { setShowCampaignForm(false); fetchData(); });
                        }}>
                            <input name="name" placeholder="Campaign Name" required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                            <input name="subject" placeholder="Subject (Email)" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                            <textarea name="content" placeholder="Content" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem', height: '100px' }} />
                            <select name="type" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }}>
                                <option value="EMAIL">Email</option>
                                <option value="SMS">SMS</option>
                            </select>
                            <select name="segmentId" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }}>
                                <option value="">Select Segment...</option>
                                {segments.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <Button type="button" onClick={() => setShowCampaignForm(false)} style={{ background: '#94a3b8' }}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Segment Modal */}
            {showSegmentForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '500px' }}>
                        <h2>New Segment</h2>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Enter Criteria as JSON for now (e.g. {`{"minPoints": 500}`})</p>
                        <form onSubmit={(e: any) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            fetch('/api/admin/segments', {
                                method: 'POST',
                                body: JSON.stringify(Object.fromEntries(formData)),
                            }).then(() => { setShowSegmentForm(false); fetchData(); });
                        }}>
                            <input name="name" placeholder="Segment Name" required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                            <textarea name="criteria" placeholder='{"minPoints": 100, "inactiveDays": 30}' required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem', height: '100px', fontFamily: 'monospace' }} />

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <Button type="button" onClick={() => setShowSegmentForm(false)} style={{ background: '#94a3b8' }}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Promo Modal */}
            {showPromoForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '500px' }}>
                        <h2>New Promo Code</h2>
                        <form onSubmit={(e: any) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            fetch('/api/admin/promocodes', {
                                method: 'POST',
                                body: JSON.stringify(Object.fromEntries(formData)),
                            }).then(() => { setShowPromoForm(false); fetchData(); });
                        }}>
                            <input name="code" placeholder="Code (e.g. WELCOME10)" required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                            <select name="type" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }}>
                                <option value="FLAT">Flat Amount ($)</option>
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="BONUS_POINTS">Bonus Points</option>
                            </select>
                            <input name="value" type="number" placeholder="Value (e.g. 10)" required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                            <input name="usageLimit" type="number" placeholder="Limit (Optional)" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <Button type="button" onClick={() => setShowPromoForm(false)} style={{ background: '#94a3b8' }}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
