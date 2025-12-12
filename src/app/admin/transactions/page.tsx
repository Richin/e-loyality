'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        fetchTx();
    }, [filterType]);

    const fetchTx = async () => {
        setLoading(true);
        const query = filterType ? `?type=${filterType}` : '';
        const res = await fetch(`/api/admin/transactions${query}`);
        const data = await res.json();
        setTransactions(data.error ? [] : data);
        setLoading(false);
    };

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Transaction Explorer</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                    <option value="">All Types</option>
                    <option value="EARN">Earn</option>
                    <option value="REDEEM">Redeem</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                </select>
                <Button onClick={fetchTx}>Refresh</Button>
            </div>

            {loading ? <div>Loading...</div> : (
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#64748b' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Type</th>
                                <th style={{ padding: '1rem' }}>Description</th>
                                <th style={{ padding: '1rem' }}>Source</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Points</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx: any) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{tx.memberProfile?.user?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>{tx.memberProfile?.user?.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                            background: tx.type === 'EARN' ? '#dcfce7' : tx.type === 'REDEEM' ? '#fee2e2' : '#f3f4f6',
                                            color: tx.type === 'EARN' ? '#166534' : tx.type === 'REDEEM' ? '#b91c1c' : '#374151'
                                        }}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{tx.description}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {tx.store ? `🏪 ${tx.store.name}` : (tx.source || 'SYSTEM')}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: tx.points > 0 ? '#16a34a' : '#ef4444' }}>
                                        {tx.points > 0 ? '+' : ''}{tx.points}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {tx.amount ? `$${tx.amount.toFixed(2)}` : '-'}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
