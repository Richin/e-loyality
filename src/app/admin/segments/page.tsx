'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SegmentsPage() {
    const [segments, setSegments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        minPoints: '0',
        daysInactive: '0'
    });

    const fetchSegments = async () => {
        const res = await fetch('/api/admin/segments');
        if (res.ok) setSegments(await res.json());
    };

    useEffect(() => {
        fetchSegments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Construct Criteria JSON
        const criteria = {
            minPoints: Number(formData.minPoints),
            daysInactive: Number(formData.daysInactive)
        };

        await fetch('/api/admin/segments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: formData.name, criteria: JSON.stringify(criteria) })
        });
        setFormData({ name: '', minPoints: '0', daysInactive: '0' });
        fetchSegments();
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Audience Segments</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Form */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', alignSelf: 'start' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Create Segment</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Segment Name</label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. VIP High Spenders" required />
                        </div>
                        <h4 style={{ margin: '1rem 0 0.5rem', color: '#666' }}>Criteria</h4>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Minimum Points</label>
                            <Input type="number" value={formData.minPoints} onChange={e => setFormData({ ...formData, minPoints: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Days Inactive (Login)</label>
                            <Input type="number" value={formData.daysInactive} onChange={e => setFormData({ ...formData, daysInactive: e.target.value })} />
                        </div>
                        <Button type="submit" fullWidth>Save Segment</Button>
                    </form>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {segments.map(s => {
                        const criteria = JSON.parse(s.criteria);
                        return (
                            <div key={s.id} style={{
                                background: 'white', padding: '1.5rem', borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <h3 style={{ margin: 0, color: '#333' }}>{s.name}</h3>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                    <span style={{ background: '#eef', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                                        Min Points: {criteria.minPoints}
                                    </span>
                                    <span style={{ background: '#ffe', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                                        Inactive: {criteria.daysInactive} days
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {segments.length === 0 && <p>No segments defined.</p>}
                </div>
            </div>
        </div>
    );
}
