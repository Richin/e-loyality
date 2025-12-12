'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AdminStoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        const res = await fetch('/api/admin/stores');
        const data = await res.json();
        setStores(data.error ? [] : data);
        setLoading(false);
    };

    const isOnline = (dateStr: string) => {
        if (!dateStr) return false;
        const lastSync = new Date(dateStr);
        const now = new Date();
        // Online if synced in last 10 minutes
        return (now.getTime() - lastSync.getTime()) < 10 * 60 * 1000;
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this store?')) return;
        await fetch(`/api/admin/stores?id=${id}`, { method: 'DELETE' });
        fetchStores();
    };

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Physical Stores & POS</h1>
                <Button onClick={() => setShowForm(true)}>+ Add Store</Button>
            </div>

            {loading ? <div>Loading Stores...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {stores.map((s: any) => {
                        const online = isOnline(s.lastSyncAt);
                        return (
                            <Card key={s.id} title={s.name}>
                                <div style={{ position: 'relative' }}>
                                    {/* Status Dot */}
                                    <div style={{
                                        position: 'absolute', top: -45, right: 0,
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        fontSize: '0.8rem', fontWeight: 'bold',
                                        color: online ? '#16a34a' : '#dc2626'
                                    }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: online ? '#16a34a' : '#dc2626' }}></div>
                                        {online ? 'ONLINE' : 'OFFLINE'}
                                    </div>

                                    <div style={{ marginTop: '1rem', lineHeight: '1.6', fontSize: '0.9rem', color: '#666' }}>
                                        <div>📍 {s.address}, {s.city}</div>
                                        <div>💳 {s._count?.transactions || 0} Transactions</div>
                                        <div>🔄 Last Sync: {s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString() : 'Never'}</div>
                                    </div>

                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                                        <button onClick={() => handleDelete(s.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            Delete Store
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
                        <h2>Add New Store</h2>
                        <form onSubmit={(e: any) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            fetch('/api/admin/stores', {
                                method: 'POST',
                                body: JSON.stringify(Object.fromEntries(formData)),
                            }).then(() => { setShowForm(false); fetchStores(); });
                        }}>
                            <input name="name" placeholder="Store Name" required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                            <input name="address" placeholder="Address" required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                            <input name="city" placeholder="City" required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                            <input name="postalCode" placeholder="Postal Code" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <Button type="button" onClick={() => setShowForm(false)} style={{ background: '#94a3b8' }}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
