'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function StoreDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [store, setStore] = useState<any>(null);
    const [stats, setStats] = useState<any>({});
    const [staffList, setStaffList] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('overview'); // overview, staff, audit
    const [showStaffModal, setShowStaffModal] = useState(false);

    useEffect(() => {
        loadData();
    }, [params.id]);

    const loadData = async () => {
        if (!params.id) return;
        setLoading(true);

        // Parallel fetches
        const [storeRes, statsRes, staffRes] = await Promise.all([
            fetch(`/api/admin/stores?id=${params.id}`), // Reusing list API for basic detail if supported, else assume fetch all and find or build specific detail API? 
            // Actually I don't have a specific detail API yet, I'll use the list one and filtering or assume I should assume I fetched all stores.
            // Wait, I created /api/admin/stores but it returns ALL lists or CREATE. I should add GET by ID to it? 
            // Or I can filter on client side if list is small, but better to fix API.
            // For now I'll fetch stats and staff which ARE specific.
            // I'll fetch defaults.
            fetch(`/api/admin/stores/analytics?storeId=${params.id}`),
            fetch(`/api/admin/stores/staff?storeId=${params.id}`)
        ]);

        // I need to fetch Store Details specifically.
        // I will use a simple fetch to existing /api/admin/stores and filter client side for now as quick fix.
        // Optimization: Update API to support ?id=...
        const stores = await (await fetch('/api/admin/stores')).json();
        const foundStore = stores.find((s: any) => s.id === params.id);

        setStore(foundStore);
        setStats(await statsRes.json());
        setStaffList(await staffRes.json());
        setLoading(false);
    };

    const addStaff = async (e: any) => {
        e.preventDefault();
        const email = e.target.email.value;
        const role = e.target.role.value;

        const res = await fetch(`/api/admin/stores/staff?storeId=${params.id}`, {
            method: 'POST',
            body: JSON.stringify({ email, role })
        });

        if (res.ok) {
            setShowStaffModal(false);
            loadData();
            alert('Staff added');
        } else {
            const err = await res.json();
            alert('Error: ' + err.error);
        }
    };

    const removeStaff = async (id: string) => {
        if (!confirm('Remove this staff member?')) return;
        await fetch(`/api/admin/stores/staff?id=${id}`, { method: 'DELETE' });
        loadData();
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Store...</div>;
    if (!store) return <div style={{ padding: '2rem' }}>Store not found</div>;

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{store.name}</h1>
                    <p style={{ color: '#64748b' }}>Store Code: <b>{store.code || 'N/A'}</b> • Status: <span style={{ color: store.posStatus === 'ONLINE' ? 'green' : 'red' }}>{store.posStatus}</span></p>
                </div>
                <Button onClick={() => router.push('/admin/stores')}>Back to List</Button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                {['overview', 'staff'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                        color: activeTab === tab ? '#2563eb' : '#64748b', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer'
                    }}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <Card title="Revenue (Points Value)">
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>{stats.revenue?.toLocaleString() || 0}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Lifetime transaction value</div>
                    </Card>
                    <Card title="Points Issued">
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.pointsIssued?.toLocaleString() || 0}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Total loyalty points given</div>
                    </Card>
                    <Card title="Redemptions">
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b91c1c' }}>{stats.redemptions?.toLocaleString() || 0}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Rewards claimed here</div>
                    </Card>
                </div>
            )}

            {activeTab === 'staff' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Authorized Staff</h3>
                        <Button onClick={() => setShowStaffModal(true)}>+ Add Staff</Button>
                    </div>
                    <Card>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '0.5rem' }}>Name</th>
                                    <th style={{ padding: '0.5rem' }}>Email</th>
                                    <th style={{ padding: '0.5rem' }}>Role</th>
                                    <th style={{ padding: '0.5rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map((s: any) => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.5rem' }}>{s.user.name || 'Unknown'}</td>
                                        <td style={{ padding: '0.5rem' }}>{s.user.email}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <span style={{ padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                {s.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <button onClick={() => removeStaff(s.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                                {staffList.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>No staff assigned</td></tr>}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}

            {showStaffModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
                        <h2>Assign Staff</h2>
                        <form onSubmit={addStaff}>
                            <input name="email" placeholder="User Email" required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                            <select name="role" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }}>
                                <option value="CASHIER">Cashier</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <Button type="button" onClick={() => setShowStaffModal(false)} style={{ background: '#94a3b8' }}>Cancel</Button>
                                <Button type="submit">Assign</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
