'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SecurityPage() {
    const [activeTab, setActiveTab] = useState('logs');
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        // Parallel fetch
        const [logsRes, usersRes, rolesRes] = await Promise.all([
            fetch('/api/admin/security/logs'),
            fetch('/api/admin/users'),
            fetch('/api/admin/security/roles')
        ]);

        const l = await logsRes.json();
        const u = await usersRes.json();
        const r = await rolesRes.json();

        if (l.error || u.error || r.error) {
            console.error("Security API Error", { l, u, r });
        }

        setLogs(Array.isArray(l) ? l : []);
        setUsers(Array.isArray(u) ? u : []);
        setRoles(Array.isArray(r) ? r : []);
        setLoading(false);
    };

    const handleRoleAssign = async (email: string, roleId: string) => {
        if (!confirm(`Assign role to ${email}?`)) return;
        await fetch('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify({ email, roleId })
        });
        loadData();
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Security Data...</div>;

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Security & Access Control</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                {['logs', 'users', 'roles'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                        color: activeTab === tab ? '#2563eb' : '#64748b', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer'
                    }}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'logs' && (
                <Card title="Audit Logs">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', background: '#f8fafc' }}>
                                <th style={{ padding: '0.75rem' }}>Time</th>
                                <th style={{ padding: '0.75rem' }}>Admin</th>
                                <th style={{ padding: '0.75rem' }}>Action</th>
                                <th style={{ padding: '0.75rem' }}>Details</th>
                                <th style={{ padding: '0.75rem' }}>Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log: any) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.75rem', color: '#666' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{log.admin?.name || 'Unknown'}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{ padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{log.details || '-'}</td>
                                    <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.8rem' }}>{log.targetId || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {activeTab === 'users' && (
                <Card title="Admin User Management">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '0.75rem' }}>User</th>
                                <th style={{ padding: '0.75rem' }}>Email</th>
                                <th style={{ padding: '0.75rem' }}>Current Role</th>
                                <th style={{ padding: '0.75rem' }}>Assign Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u: any) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.75rem' }}>{u.name}</td>
                                    <td style={{ padding: '0.75rem' }}>{u.email}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{u.role?.name || 'No Role'}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <select
                                            onChange={(e) => handleRoleAssign(u.email, e.target.value)}
                                            style={{ padding: '0.25rem' }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Change Role...</option>
                                            {roles.map((r: any) => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>No users with assigned roles found. Use database seed or invite flow.</td></tr>}
                        </tbody>
                    </table>
                </Card>
            )}

            {activeTab === 'roles' && (
                <Card title="System Roles">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {roles.map((r: any) => (
                            <div key={r.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{r.name}</div>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{r.description || 'No description'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r._count?.users || 0} Users Assigned</div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
