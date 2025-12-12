'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/reports')
            .then(res => res.json())
            .then(data => {
                if (data.error) alert(data.error);
                else setData(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Loading Reports...</div>;
    if (!data) return <div style={{ padding: '2rem' }}>Error loading data.</div>;

    const { statusStats, tierStats, highValue, churnRisk, topClv, tierChanges } = data;

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Customer Intelligence Reports</h1>

            {/* ROW 1: General Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <Card title="Customer Status">
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{statusStats.active}</div>
                            <div style={{ color: '#666' }}>Active</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>{statusStats.suspended}</div>
                            <div style={{ color: '#666' }}>Suspended</div>
                        </div>
                    </div>
                </Card>

                <Card title="Tier Distribution">
                    <div style={{ marginTop: '1rem' }}>
                        {tierStats.map((t: any) => (
                            <div key={t.name} style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span>{t.name}</span>
                                    <span>{t.count}</span>
                                </div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', marginTop: '2px' }}>
                                    <div style={{ width: `${(t.count / (statusStats.active + statusStats.suspended)) * 100}%`, background: '#2563eb', height: '100%', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ROW 2: Tables */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <Card title="💎 High Value Customers (VIP)">
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>Name</th>
                                <th style={{ padding: '0.5rem' }}>Tier</th>
                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>CLV</th>
                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {highValue.map((c: any) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{c.name}<br /><span style={{ fontSize: '0.75rem', color: '#999' }}>{c.email}</span></td>
                                    <td style={{ padding: '0.5rem' }}>{c.tier}</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>${c.clv.toFixed(2)}</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{c.balance.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                <Card title="⚠️ Churn Risk List (At Risk / Churned)">
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fef2f2', textAlign: 'left', color: '#b91c1c' }}>
                                <th style={{ padding: '0.5rem' }}>Name</th>
                                <th style={{ padding: '0.5rem' }}>Segment</th>
                                <th style={{ padding: '0.5rem' }}>Last Visit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {churnRisk.map((c: any) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{c.name}<br /><span style={{ fontSize: '0.75rem', color: '#999' }}>{c.email}</span></td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{
                                            background: c.segment === 'CHURNED' ? '#451a03' : '#fff7ed',
                                            color: c.segment === 'CHURNED' ? '#fff' : '#c2410c',
                                            padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem'
                                        }}>
                                            {c.segment}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'Never'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* ROW 3: CLV & Tiers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
                <Card title="📈 Top Customer Lifetime Value (CLV)">
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Based on total historical spend/points value calculated by the RFM engine.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {topClv.map((c: any, i: number) => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>
                                <span>{i + 1}. {c.name}</span>
                                <span style={{ fontWeight: 'bold' }}>${c.clv.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="📋 Recent Tier Changes (Manual)">
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Track manual overrides performed by admins.</p>
                    <table style={{ width: '100%', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#666' }}>
                                <th>Date</th>
                                <th>Admin</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tierChanges.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>No recent manual overrides.</td></tr>}
                            {tierChanges.map((log: any) => (
                                <tr key={log.id}>
                                    <td style={{ padding: '0.25rem' }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.25rem' }}>{log.admin?.name}</td>
                                    <td style={{ padding: '0.25rem' }}>{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
}
