'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerListPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchCustomers = (query = '') => {
        setLoading(true);
        fetch(`/api/admin/customers?search=${encodeURIComponent(query)}`)
            .then(res => {
                if (res.status === 403) router.push('/auth/signin');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) setCustomers(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomers(search);
    };

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Customers</h1>
                <Link href="/admin/dashboard">
                    <Button variant="ghost">Back to Dashboard</Button>
                </Link>
            </div>

            <Card>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1, padding: '0.65rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <Button type="submit">Search</Button>
                </form>

                {loading ? <p>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#64748b' }}>
                                <th style={{ padding: '1rem' }}>Name / Email</th>
                                <th style={{ padding: '1rem' }}>Tier</th>
                                <th style={{ padding: '1rem' }}>Points</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{c.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{c.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            background: c.tier === 'Platinum' ? '#e0e7ff' : c.tier === 'Gold' ? '#fef9c3' : '#f1f5f9',
                                            color: c.tier === 'Platinum' ? '#3730a3' : c.tier === 'Gold' ? '#854d0e' : '#475569',
                                            padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            {c.tier}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{c.points.toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {c.isSuspended ? (
                                            <span style={{ color: '#ef4444', background: '#fef2f2', padding: '4px 8px', borderRadius: '4px' }}>SUSPENDED</span>
                                        ) : (
                                            <span style={{ color: '#10b981', background: '#ecfdf5', padding: '4px 8px', borderRadius: '4px' }}>Active</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <Link href={`/admin/customers/${c.id}`}>
                                            <Button variant="outline" size="sm">Manage</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>
        </div>
    );
}
