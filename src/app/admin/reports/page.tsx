'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

export default function AdminReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

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

    const { statusStats, tierStats, highValue, churnRisk, topClv, tierChanges, tierUsage, pointsStats, topRewards, unusedVouchersCount, lowInventoryRewards, fraudAlerts } = data;

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Customer Intelligence Reports</h1>

            {/* TAB NAVIGATION */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem', overflowX: 'auto' }}>
                {['overview', 'points_health', 'tier_analysis', 'rewards', 'marketing', 'stores'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                        color: activeTab === tab ? '#2563eb' : '#64748b', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer', whiteSpace: 'nowrap'
                    }}>
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* --- TAB 1: OVERVIEW --- */}
            {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
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
                        <Card title="📈 Top CLV Leaderboard">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                {topClv.slice(0, 5).map((c: any, i: number) => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>
                                        <span>{i + 1}. {c.name}</span>
                                        <span style={{ fontWeight: 'bold' }}>${c.clv.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
                        <Card title="💎 High Value Customers (VIP)">
                            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem' }}>Name</th>
                                        <th style={{ padding: '0.5rem' }}>Tier</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>CLV</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {highValue.map((c: any) => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.5rem' }}>{c.name}<br /><span style={{ fontSize: '0.75rem', color: '#999' }}>{c.email}</span></td>
                                            <td style={{ padding: '0.5rem' }}>{c.tier}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>${c.clv.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                        <Card title="⚠️ Churn Risk List">
                            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', marginTop: '1rem' }}>
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
                                                <span style={{ background: c.segment === 'CHURNED' ? '#451a03' : '#fff7ed', color: c.segment === 'CHURNED' ? '#fff' : '#c2410c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{c.segment}</span>
                                            </td>
                                            <td style={{ padding: '0.5rem' }}>{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'Never'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- TAB 2: POINTS HEALTH --- */}
            {activeTab === 'points_health' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    <Card title="Points Liability Overview">
                        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>{pointsStats?.totalIssued?.toLocaleString() || 0}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Points Issued</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>{pointsStats?.totalRedeemed?.toLocaleString() || 0}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Points Redeemed</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b91c1c' }}>{pointsStats?.totalExpired?.toLocaleString() || 0}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Points Expired</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#fff7ed', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c2410c' }}>{((pointsStats?.breakageRate || 0) * 100).toFixed(1)}%</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Breakage Rate (Unused)</div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Explanation">
                        <div style={{ padding: '1rem', color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            <p style={{ marginBottom: '1rem' }}><strong>Breakage Rate:</strong> The percentage of points issued that strictly have not been redeemed. A high breakage is good for liability (less cost), but bad for engagement.</p>
                            <p><strong>Liability:</strong> Use the Total Issued - Redeemed - Expired to calculate your current financial exposure based on your cost-per-point.</p>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- TAB 3: TIER ANALYSIS --- */}
            {activeTab === 'tier_analysis' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    <Card title="Membership Distribution">
                        <div style={{ marginTop: '1rem' }}>
                            {tierStats.map((t: any) => (
                                <div key={t.name} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: '600' }}>{t.name}</span>
                                        <span>{t.count} members</span>
                                    </div>
                                    <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px' }}>
                                        <div style={{ width: `${(t.count / (statusStats.active + statusStats.suspended)) * 100}%`, background: '#2563eb', height: '100%', borderRadius: '6px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Tier Benefits Usage (Redemptions)">
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Which tier segments are redeeming the most rewards?</p>
                        <div style={{ marginTop: '1rem' }}>
                            {/* @ts-ignore */}
                            {tierUsage && tierUsage.map((t: any) => (
                                <div key={t.name} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: '600' }}>{t.name}</span>
                                        <span>{t.count} redemptions</span>
                                    </div>
                                    <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px' }}>
                                        <div style={{ width: '100%', background: '#10b981', height: '100%', borderRadius: '6px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Recent Tier Manual Overrides">
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
            )}

            {/* --- TAB 4: REWARDS & FRAUD --- */}
            {activeTab === 'rewards' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                    <Card title="🏆 Top Redeemed Rewards">
                        <div style={{ marginTop: '1rem' }}>
                            {/* @ts-ignore */}
                            {topRewards && topRewards.map((r: any, i: number) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>
                                    <span>{r.name}</span>
                                    <span style={{ fontWeight: 'bold' }}>{r.count} redeemed</span>
                                </div>
                            ))}
                            {(!topRewards || topRewards.length === 0) && <div style={{ color: '#888' }}>No redemptions yet.</div>}
                        </div>
                    </Card>

                    <Card title="🛡️ Security & Inventory Alerts">
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1, padding: '1rem', background: '#fff7ed', borderRadius: '6px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c2410c' }}>{unusedVouchersCount || 0}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Active Unused Vouchers</div>
                            </div>
                        </div>

                        {lowInventoryRewards && lowInventoryRewards.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 'bold', color: '#b91c1c', marginBottom: '0.5rem' }}>Low Stock Alerts:</div>
                                {lowInventoryRewards.map((r: any) => (
                                    <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#b91c1c' }}>
                                        <span>{r.name}</span>
                                        <span>{r.inventory} left</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {fraudAlerts && fraudAlerts.length > 0 && (
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#b91c1c', marginBottom: '0.5rem' }}>High Velocity Redemptions (Possible Fraud):</div>
                                {fraudAlerts.map((f: any) => (
                                    <div key={f.email} style={{ fontSize: '0.85rem', background: '#fef2f2', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
                                        <strong>{f.name}</strong> ({f.email}) <br />
                                        redeemed {f.count} times in 24h.
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}
            {/* --- TAB 5: MARKETING & ROI --- */}
            {activeTab === 'marketing' && (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {/* Campaign ROI Table */}
                    <Card title="Campaign Performance & ROI (7-Day Attribution)">
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', color: '#64748b' }}>
                                    <th style={{ padding: '0.5rem' }}>Campaign</th>
                                    <th style={{ padding: '0.5rem' }}>Sent</th>
                                    <th style={{ padding: '0.5rem' }}>Conversions</th>
                                    <th style={{ padding: '0.5rem' }}>Conv. Rate</th>
                                    <th style={{ padding: '0.5rem' }}>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* @ts-ignore */}
                                {data.campaignsStats?.map((c: any) => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{c.name}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{c.sentCount}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{c.conversions}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            {c.sentCount > 0 ? ((c.conversions / c.sentCount) * 100).toFixed(1) : 0}%
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', color: '#16a34a', fontWeight: 'bold' }}>
                                            ${c.revenue.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!data.campaignsStats || data.campaignsStats.length === 0) && <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>No sent campaigns yet.</td></tr>}
                            </tbody>
                        </table>
                    </Card>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {/* Promo Codes */}
                        <Card title="Top Promo Codes">
                            {/* @ts-ignore */}
                            {data.promoStats?.map((p: any, i: number) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                                    <div>
                                        <span style={{ fontWeight: 'bold', display: 'block' }}>{p.code}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{p.type}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>{p.usedCount}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>uses</span>
                                    </div>
                                </div>
                            ))}
                        </Card>

                        {/* Channel Split */}
                        <Card title="Channel Engagement">
                            {/* @ts-ignore */}
                            {data.channelStats?.map((ch: any, i: number) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: ch.channel === 'EMAIL' ? '#3b82f6' : '#10b981' }}></div>
                                        <span>{ch.channel}</span>
                                    </div>
                                    <strong>{ch._count.id} messages</strong>
                                </div>
                            ))}
                            {(!data.channelStats || data.channelStats.length === 0) && <div style={{ color: '#aaa' }}>No messages sent.</div>}
                        </Card>
                    </div>
                </div>
            )}
            {/* --- TAB 6: STORE PERFORMANCE --- */}
            {activeTab === 'stores' && (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <Card title="Refunds & Reversals">
                            <div style={{ padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{data.refundsCount || 0}</div>
                                <div style={{ color: '#666' }}>Return Transactions Processed</div>
                            </div>
                        </Card>

                        <Card title="Store Leaderboard (Revenue)">
                            <div style={{ marginTop: '1rem' }}>
                                {/* @ts-ignore */}
                                {data.storePerformance?.sort((a, b) => b.revenue - a.revenue).map((s: any, i: number) => (
                                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{i + 1}. {s.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: s.posStatus === 'ONLINE' ? '#16a34a' : '#dc2626' }}>
                                                {s.posStatus}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: '#16a34a' }}>${s.revenue.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{s.pointsIssued.toLocaleString()} pts</div>
                                        </div>
                                    </div>
                                ))}
                                {(!data.storePerformance || data.storePerformance.length === 0) && <div style={{ color: '#888' }}>No store data available.</div>}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
