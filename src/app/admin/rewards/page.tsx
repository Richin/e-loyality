'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RewardsPage() {
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingReward, setEditingReward] = useState<any>(null);

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/rewards');
            setRewards(await res.json());
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const saveReward = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data: any = {};
        form.forEach((value, key) => data[key] = value);

        // Handle checkboxes/booleans
        data.autoApprove = form.get('autoApprove') === 'on';
        data.isActive = form.get('isActive') === 'on';
        if (editingReward?.id) data.id = editingReward.id;

        await fetch('/api/admin/rewards', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        setShowForm(false);
        setEditingReward(null);
        fetchRewards();
    };

    const deleteReward = async (id: string) => {
        if (!confirm('This action cannot be undone. Delete?')) return;
        await fetch(`/api/admin/rewards?id=${id}`, { method: 'DELETE' });
        fetchRewards();
    };

    const openEdit = (r: any) => {
        setEditingReward(r);
        setShowForm(true);
    };

    const openNew = () => {
        setEditingReward(null);
        setShowForm(true);
    };

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Reward Management</h1>
                <Button onClick={openNew}>+ New Reward</Button>
            </div>

            {showForm && (
                <Card title={editingReward ? 'Edit Reward' : 'Create New Reward'} style={{ marginBottom: '2rem', border: '1px solid #2563eb' }}>
                    <form onSubmit={saveReward} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                        {/* Basic Info */}
                        <div style={{ gridColumn: 'span 2', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.5rem' }}>Basic Information</div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>Reward Name</label>
                            <input name="name" required defaultValue={editingReward?.name} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>Points Cost</label>
                            <input name="pointsCost" type="number" required defaultValue={editingReward?.pointsCost || 100} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>Category</label>
                            <select name="category" defaultValue={editingReward?.category || 'OTHER'} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }}>
                                <option value="OTHER">Other</option>
                                <option value="FOOD">Food & Beverage</option>
                                <option value="MERCH">Merchandise</option>
                                <option value="VOUCHER">Voucher / Coupon</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>Type</label>
                            <select name="type" defaultValue={editingReward?.type || 'DIGITAL'} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }}>
                                <option value="DIGITAL">Digital (Code/Email)</option>
                                <option value="PHYSICAL">Physical (Inventory)</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>Description</label>
                            <textarea name="description" defaultValue={editingReward?.description} rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                        </div>

                        {/* Inventory & Limits */}
                        <div style={{ gridColumn: 'span 2', fontWeight: 'bold', color: '#3b82f6', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>Controls & Limits</div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>Inventory Stock (Leave blank for unlimited)</label>
                            <input name="inventory" type="number" defaultValue={editingReward?.inventory} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Unlimited" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>Limit Per User (Leave blank for unlimited)</label>
                            <input name="limitPerUser" type="number" defaultValue={editingReward?.limitPerUser} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} placeholder="Unlimited" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>Start Date</label>
                            <input name="startDate" type="date" defaultValue={editingReward?.startDate ? new Date(editingReward.startDate).toISOString().split('T')[0] : ''} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>End Date</label>
                            <input name="endDate" type="date" defaultValue={editingReward?.endDate ? new Date(editingReward.endDate).toISOString().split('T')[0] : ''} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                        </div>

                        {/* Voucher Settings */}
                        <div style={{ gridColumn: 'span 2', fontWeight: 'bold', color: '#3b82f6', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>Voucher Automation</div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem' }}>Voucher Code Prefix (e.g. GIFT-)</label>
                            <input name="voucherPrefix" defaultValue={editingReward?.voucherPrefix} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <input type="checkbox" name="autoApprove" defaultChecked={editingReward ? editingReward.autoApprove : true} id="auto" style={{ transform: 'scale(1.2)' }} />
                            <label htmlFor="auto" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Auto-Approve Redemptions?</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <input type="checkbox" name="isActive" defaultChecked={editingReward ? editingReward.isActive : true} id="active" style={{ transform: 'scale(1.2)' }} />
                            <label htmlFor="active" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Reward is Active</label>
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <Button type="submit">Save Reward</Button>
                            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                </Card>
            )}

            {loading ? <div>Loading...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {rewards.map((r: any) => (
                        <Card key={r.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{r.name}</h3>
                                    <div style={{ color: '#2563eb', fontWeight: 'bold', marginBottom: '0.5rem' }}>{r.pointsCost} Points</div>
                                </div>
                                <div style={{ fontSize: '0.8rem', background: r.isActive ? '#dcfce7' : '#fee2e2', color: r.isActive ? '#166534' : '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>
                                    {r.isActive ? 'Active' : 'Hidden'}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#666', height: '2.5rem', overflow: 'hidden' }}>{r.description}</p>

                            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555', background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px' }}>
                                <div>📦 Type: <strong>{r.type}</strong></div>
                                <div>🔢 Stock: <strong>{r.inventory === null ? 'Unlimited' : r.inventory}</strong></div>
                                <div>⚡ Auto-Approve: <strong>{r.autoApprove ? 'Yes' : 'No'}</strong></div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <Button size="sm" onClick={() => openEdit(r)}>Edit</Button>
                                <Button size="sm" style={{ background: '#dc2626' }} onClick={() => deleteReward(r.id)}>Delete</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
