'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function VouchersPage() {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [searchCode, setSearchCode] = useState('');
    const [searchedVoucher, setSearchedVoucher] = useState<any>(null);

    const fetchVouchers = async () => {
        const res = await fetch('/api/admin/vouchers');
        if (res.ok) setVouchers(await res.json());
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleSearch = async () => {
        if (!searchCode) return;
        const res = await fetch(`/api/admin/vouchers?code=${searchCode}`);
        if (res.ok) {
            setSearchedVoucher(await res.json());
        } else {
            alert('Invalid Code');
            setSearchedVoucher(null);
        }
    };

    const handleRedeem = async (code: string) => {
        if (!confirm('Mark this voucher as USED?')) return;

        const res = await fetch('/api/admin/vouchers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        if (res.ok) {
            alert('Voucher Redeemed!');
            setSearchedVoucher(null);
            setSearchCode('');
            fetchVouchers();
        } else {
            const err = await res.json();
            alert(err.message);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Voucher Management</h1>

            {/* Verification Tool */}
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '1rem' }}>Validate Voucher</h2>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <Input placeholder="Enter Voucher Code (e.g. V-123456-789)" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
                    <Button onClick={handleSearch}>Verify</Button>
                </div>

                {searchedVoucher && (
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #ddd' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, auto) 1fr', gap: '0.5rem 1rem' }}>
                            <strong>Status:</strong>
                            <span style={{
                                color: searchedVoucher.usedAt ? 'red' : (new Date() > new Date(searchedVoucher.expiresAt) ? 'orange' : 'green'),
                                fontWeight: 'bold'
                            }}>
                                {searchedVoucher.usedAt ? 'USED' : (new Date() > new Date(searchedVoucher.expiresAt) ? 'EXPIRED' : 'VALID')}
                            </span>

                            <strong>Reward:</strong> <span>{searchedVoucher.reward?.name}</span>
                            <strong>Member:</strong> <span>{searchedVoucher.memberProfile?.user?.name || 'Unknown'}</span>
                            <strong>Expires:</strong> <span>{new Date(searchedVoucher.expiresAt).toLocaleDateString()}</span>
                        </div>
                        {!searchedVoucher.usedAt && new Date() < new Date(searchedVoucher.expiresAt) && (
                            <div style={{ marginTop: '1rem' }}>
                                <Button onClick={() => handleRedeem(searchedVoucher.code)}>Burn / Redeem Voucher</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* List */}
            <h2>Recent Vouchers</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'white' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: '#f8f9fa' }}>
                        <th style={{ padding: '1rem' }}>Code</th>
                        <th style={{ padding: '1rem' }}>Reward</th>
                        <th style={{ padding: '1rem' }}>User</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {vouchers.map(v => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '1rem' }}>{v.code}</td>
                            <td style={{ padding: '1rem' }}>{v.reward?.name}</td>
                            <td style={{ padding: '1rem' }}>{v.memberProfile?.user?.name}</td>
                            <td style={{ padding: '1rem' }}>
                                {v.usedAt ? 'USED' : (new Date() > new Date(v.expiresAt) ? 'EXPIRED' : 'ACTIVE')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
