'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface DashboardData {
    kpis: {
        totalMembers: number;
        newSignups: number;    // Monthly
        dailySignups: number;  // Daily
        totalPointsLiability: number;
        estFinancialLiability: number;
        redemptionRate: number;
    };
    pointsFlow: {
        earned: number;
        redeemed: number;
    };
    tierDistribution: { name: string; count: number }[];
    churnStats: { name: string; value: number }[];
    topPerformingRewards: { name: string; count: number }[];
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(res => {
                if (res.status === 403 || res.status === 401) {
                    window.location.href = '/';
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data) setData(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Loading Admin Analytics...</div>;
    if (!data || !data.kpis) return (
        <div style={{ padding: '2rem', color: 'red' }}>
            <h2>Error Loading Dashboard</h2>
            <p>Could not fetch analytics data. Please check server logs.</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Executive Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="/admin/customers" style={{
                        padding: '0.75rem 1.5rem',
                        background: '#2563eb',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                    }}>
                        Manage Customers
                    </a>
                </div>
            </div>

            {/* KPI ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <Card title="Acquisition">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{data.kpis.totalMembers}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Members</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#16a34a' }}>+{data.kpis.dailySignups}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Today</div>
                            <div style={{ fontSize: '0.9rem', color: '#16a34a' }}>+{data.kpis.newSignups}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>This Month</div>
                        </div>
                    </div>
                </Card>
                <Card title="Liability Exposure">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#eab308' }}>${data.kpis.estFinancialLiability.toFixed(2)}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Outstanding Points Value</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>{data.kpis.totalPointsLiability.toLocaleString()} pts pending</div>
                </Card>
                <Card title="Redemption Health">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{data.kpis.redemptionRate.toFixed(1)}%</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Burn Rate (Redeem/Earn)</div>
                </Card>
                <Card title="Churn Risk">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                        {data.churnStats.find(s => s.name === 'AT_RISK')?.value || 0}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Users 'At Risk'</div>
                </Card>
            </div>

            {/* CHARTS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* POINTS FLOW CHART */}
                <Card title="Points Analysis: Issued vs Redeemed">
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#64748b' }}>Points Issued (Earned)</div>
                            <div style={{ height: '24px', background: '#dbeafe', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: '100%', background: '#3b82f6' }}></div>
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '0.25rem' }}>{data.pointsFlow.earned.toLocaleString()}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#64748b' }}>Points Redeemed (Burned)</div>
                            <div style={{ height: '24px', background: '#dcfce7', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min((data.pointsFlow.redeemed / data.pointsFlow.earned) * 100, 100)}%`, height: '100%', background: '#22c55e' }}></div>
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '0.25rem' }}>{data.pointsFlow.redeemed.toLocaleString()}</div>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem', fontStyle: 'italic' }}>
                        Healthy programs typically aim for a 15-20% redemption rate to ensure engagement without excessive liability.
                    </p>
                </Card>

                {/* TIER DISTRIBUTION */}
                <Card title="Member Tier Distribution">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {data.tierDistribution.length === 0 && <p style={{ color: '#999' }}>No data available.</p>}
                        {data.tierDistribution.map(tier => {
                            const total = data.kpis.totalMembers || 1;
                            const percentage = (tier.count / total) * 100;
                            return (
                                <div key={tier.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                        <span style={{ fontWeight: '600' }}>{tier.name}</span>
                                        <span>{tier.count} ({percentage.toFixed(0)}%)</span>
                                    </div>
                                    <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '4px', height: '12px' }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            background: tier.name === 'Platinum' ? '#e5e7eb' : tier.name === 'Gold' ? '#facc15' : '#94a3b8',
                                            height: '100%', borderRadius: '4px'
                                        }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* TOP CAMPAIGNS / REWARDS */}
                <Card title="Top Redeemed Rewards">
                    <div style={{ marginTop: '1rem' }}>
                        {data.topPerformingRewards.length === 0 ? <p style={{ color: '#999' }}>No redemptions yet.</p> : (
                            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#64748b' }}>
                                        <th style={{ paddingBottom: '0.5rem' }}>Reward Name</th>
                                        <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.topPerformingRewards.map((r, i) => (
                                        <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.75rem 0' }}>{r.name}</td>
                                            <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 'bold' }}>{r.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>

                {/* CHURN SEGMENTS */}
                <Card title="Customer Health">
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        {data.churnStats.map(stat => (
                            <div key={stat.name} style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                background: stat.name === 'VIP' ? '#f0fdf4' : stat.name === 'AT_RISK' ? '#fef2f2' : '#f8fafc',
                                border: '1px solid #e2e8f0',
                                flex: 1,
                                minWidth: '120px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#334155' }}>{stat.value}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{stat.name.replace('_', ' ')}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
