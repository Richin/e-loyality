'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState('');

    const fetchKeys = async () => {
        const res = await fetch('/api/admin/apikeys');
        if (res.ok) {
            setKeys(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const generateKey = async () => {
        if (!newKeyName) return;
        await fetch('/api/admin/apikeys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newKeyName })
        });
        setNewKeyName('');
        fetchKeys();
    };

    const toggleKey = async (id: string, currentStatus: boolean) => {
        await fetch('/api/admin/apikeys', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isActive: !currentStatus })
        });
        fetchKeys();
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>System Settings</h1>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '1rem' }}>Open API Keys (POS Integration)</h2>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <Input
                        placeholder="Key Name (e.g. POS Terminal 1)"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                    />
                    <Button onClick={generateKey} disabled={!newKeyName}>Generate Key</Button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Name</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>API Key</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Status</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Last Used</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map(k => (
                            <tr key={k.id}>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{k.name}</td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', fontFamily: 'monospace' }}>{k.key}</td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                        background: k.isActive ? '#e6f4ea' : '#fbe9e7',
                                        color: k.isActive ? '#1e7e34' : '#c62828'
                                    }}>
                                        {k.isActive ? 'Active' : 'Revoked'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                                </td>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => toggleKey(k.id, k.isActive)}
                                    >
                                        {k.isActive ? 'Revoke' : 'Activate'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
