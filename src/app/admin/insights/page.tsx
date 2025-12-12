'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

export default function AdminInsightsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/insights')
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Loading Insights...</div>;
    if (!data) return <div style={{ padding: '2rem' }}>Error loading data.</div>;
    if (data.error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {data.error}</div>;

    const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Analytics & Insights</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>

                {/* 1. Peak Shopping Hours */}
                <Card title="Peak Shopping Hours (Purchase Time Heatmap)">
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={data.peakHours}>
                                <XAxis dataKey="hour" fontSize={12} stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 2. Customer Funnel */}
                <Card title="Customer Retention Funnel">
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={data.funnel}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="stage" fontSize={12} stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#ddd6fe" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 3. Revenue Trends */}
                <Card title="Revenue Trend (Last 30 Days)">
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <LineChart data={data.trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" fontSize={12} stroke="#94a3b8" />
                                <YAxis yAxisId="left" stroke="#16a34a" />
                                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                                <Tooltip />
                                <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2} dot={false} name="Revenue ($)" />
                                <Line yAxisId="right" type="monotone" dataKey="earn" stroke="#f59e0b" strokeWidth={2} dot={false} name="Points Earned" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 4. Churn Risk */}
                <Card title="Churn Risk Distribution (Predictive)">
                    <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data.churn}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.churn.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>
                            {data.churn.map((entry: any, index: number) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', background: COLORS[index], borderRadius: '2px', marginRight: '0.5rem' }}></div>
                                    <span>{entry.name}: {entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
}
