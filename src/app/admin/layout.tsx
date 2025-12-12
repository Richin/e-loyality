import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ background: '#1e293b', padding: '1rem 0', color: 'white' }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto', padding: '0 2rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <Link href="/admin/dashboard" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>
                            Admin Console
                        </Link>
                        <nav style={{ display: 'flex', gap: '1.5rem' }}>
                            <Link href="/admin/dashboard" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Dashboard</Link>
                            <Link href="/admin/customers" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Customers</Link>
                            <Link href="/admin/reports" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Reports</Link>
                            <Link href="/admin/configuration" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Configuration</Link>
                            <Link href="/admin/rewards" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Rewards</Link>
                            <Link href="/admin/redemptions" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Redemptions</Link>
                        </nav>
                    </div>
                    <div>
                        <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>
                            Exit to App &rarr;
                        </Link>
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, background: '#f8fafc' }}>
                {children}
            </main>
        </div>
    );
}
