'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminFinancePage() {
    const [activeTab, setActiveTab] = useState('overview'); // overview, reports
    const [summary, setSummary] = useState<any>(null);
    const [reconciliation, setReconciliation] = useState<any[]>([]);
    const [liabilityReport, setLiabilityReport] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [sumRes, recRes, reportRes] = await Promise.all([
            fetch('/api/admin/finance/summary'),
            fetch('/api/admin/finance/reconciliation'),
            fetch('/api/admin/finance/reports/liability?limit=100')
        ]);

        const sumData = await sumRes.json();
        const recData = await recRes.json();
        const reportData = await reportRes.json();

        if (sumData.error || recData.error || reportData.error) {
            console.error("Finance API Error", { sum: sumData, rec: recData, rep: reportData });
            setSummary(sumData.error ? null : sumData);
        } else {
            setSummary(sumData);
        }

        setReconciliation(Array.isArray(recData) ? recData : []);
        setLiabilityReport(Array.isArray(reportData) ? reportData : []);
        setLoading(false);
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Financial Data...</div>;
    if (!summary || summary.error) return <div style={{ padding: '2rem', color: 'red' }}>Error loading finance data. Please restart the server.</div>;

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Finance & Accounting</h1>

            {/* Menu Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <button onClick={() => setActiveTab('overview')} style={{
                    padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                    borderBottom: activeTab === 'overview' ? '2px solid #2563eb' : 'none',
                    color: activeTab === 'overview' ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer'
                }}>
                    Overview
                </button>
                <button onClick={() => setActiveTab('reports')} style={{
                    padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                    borderBottom: activeTab === 'reports' ? '2px solid #2563eb' : 'none',
                    color: activeTab === 'reports' ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer'
                }}>
                    Reports (Liability)
                </button>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Financial Health Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <Card title="Outstanding Liability">
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b91c1c' }}>
                                ${summary.pointsLiability.value?.toLocaleString() || 0}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                {summary.pointsLiability.points?.toLocaleString()} Points Outstanding
                            </div>
                        </Card>

                        <Card title="Wallet Liability">
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ca8a04' }}>
                                ${summary.walletLiability.total?.toLocaleString() || 0}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                Cashback & Prepaid Balances
                            </div>
                        </Card>

                        <Card title="Breakage Revenue">
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                                ${summary.breakage.value?.toLocaleString() || 0}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                Revenue from Expired Points
                            </div>
                        </Card>

                        <Card title="Reward Costs">
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                                ${summary.rewardCosts?.toLocaleString() || 0}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                Actual Cost of Redeemed Goods
                            </div>
                        </Card>
                    </div>

                    {/* Monthly Reconciliation */}
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Monthly Reconciliation</h2>
                    <Card>
                        <div style={{ height: '300px', marginBottom: '2rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reconciliation}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#16a34a" name="POS Revenue ($)" />
                                    <Line type="monotone" dataKey="pointsIssued" stroke="#2563eb" name="Points Issued" />
                                    <Line type="monotone" dataKey="pointsRedeemed" stroke="#b91c1c" name="Points Redeemed" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', background: '#f8fafc' }}>
                                        <th style={{ padding: '1rem' }}>Period</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>POS Revenue</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Points Issued</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Value Issued (Est)</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reconciliation.map((r: any) => {
                                        const estValue = r.pointsIssued * 0.01;
                                        const ratio = r.revenue > 0 ? (estValue / r.revenue) * 100 : 0;
                                        return (
                                            <tr key={r.month} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{r.month}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>${r.revenue.toLocaleString()}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>{r.pointsIssued.toLocaleString()}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>${estValue.toFixed(2)}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <span style={{
                                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                                        background: ratio > 5 ? '#fee2e2' : '#dcfce7',
                                                        color: ratio > 5 ? '#b91c1c' : '#166534'
                                                    }}>
                                                        {ratio.toFixed(1)}% Cost
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}

            {activeTab === 'reports' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>User Liability Register (Top 100)</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button onClick={() => alert('Download CSV feature pending')}>Download CSV</Button>
                        </div>
                    </div>
                    <Card>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', background: '#f8fafc' }}>
                                    <th style={{ padding: '0.75rem' }}>User</th>
                                    <th style={{ padding: '0.75rem' }}>Email</th>
                                    <th style={{ padding: '0.75rem' }}>Tier</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Points Held</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Wallet Bal.</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Liability ($)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liabilityReport.map((u: any) => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{u.name}</td>
                                        <td style={{ padding: '0.75rem', color: '#666' }}>{u.email}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem',
                                                background: '#f1f5f9', color: '#475569'
                                            }}>
                                                {u.tier}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{u.points.toLocaleString()}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            ${(u.cashback + u.prepaid).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#b91c1c' }}>
                                            ${u.liabilityValue.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}
        </div>
    );
}
