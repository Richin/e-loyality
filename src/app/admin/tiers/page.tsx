'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function TiersPage() {
    const [tiers, setTiers] = useState<any[]>([]);
    const [formData, setFormData] = useState({ name: '', threshold: '0', benefits: '' });

    const fetchTiers = async () => {
        const res = await fetch('/api/admin/tiers');
        if (res.ok) setTiers(await res.json());
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/tiers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setFormData({ name: '', threshold: '0', benefits: '' });
        fetchTiers();
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Loyalty Tiers</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Form */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', alignSelf: 'start' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Add / Update Tier</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tier Name</label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Platinum" required />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Points Threshold</label>
                            <Input type="number" value={formData.threshold} onChange={e => setFormData({ ...formData, threshold: e.target.value })} placeholder="0" required />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Benefits (Comma separated)</label>
                            <textarea
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                rows={3}
                                value={formData.benefits}
                                onChange={e => setFormData({ ...formData, benefits: e.target.value })}
                            />
                        </div>
                        <Button type="submit" fullWidth>Save Tier</Button>
                    </form>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tiers.map(t => (
                        <div key={t.id} style={{
                            background: 'white', padding: '1.5rem', borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#333' }}>{t.name}</h3>
                                <p style={{ margin: '0.5rem 0 0', color: '#666' }}>Requires: {t.threshold} points</p>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#888' }}>Benefits: {t.benefits}</p>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#eee' }}>
                                {t.threshold}
                            </div>
                        </div>
                    ))}
                    {tiers.length === 0 && <p>No tiers configured.</p>}
                </div>
            </div>
        </div>
    );
}
