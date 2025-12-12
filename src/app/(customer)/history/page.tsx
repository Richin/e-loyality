import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function HistoryPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        redirect('/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberProfile: {
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 50
                    }
                }
            }
        }
    });

    if (!user || !user.memberProfile) {
        return <div>Profile not found</div>;
    }

    const transactions = user.memberProfile.transactions;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Transaction History</h1>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {transactions.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>No transactions found.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: '#666', fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '1rem', color: '#666', fontSize: '0.85rem', textTransform: 'uppercase' }}>Details</th>
                                <th style={{ padding: '1rem', color: '#666', fontSize: '0.85rem', textTransform: 'uppercase' }}>Source</th>
                                <th style={{ padding: '1rem', color: '#666', fontSize: '0.85rem', textTransform: 'uppercase' }}>Type</th>
                                <th style={{ padding: '1rem', color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Points/Cashback</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{tx.description || 'Transaction'}</div>
                                        {tx.orderId && (
                                            <div style={{ fontSize: '0.8rem', color: '#3498db', marginTop: '2px' }}>
                                                Order #{tx.orderId}
                                            </div>
                                        )}
                                        {tx.cashbackUsed > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: '2px' }}>
                                                Cashback Used: ${tx.cashbackUsed.toFixed(2)}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {tx.source ? (
                                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#f0f0f0', borderRadius: '4px', border: '1px solid #ddd' }}>
                                                {tx.source}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            background: tx.type === 'EARN' ? '#e8f5e9' : (tx.cashbackUsed > 0 ? '#fff3e0' : '#ffebee'),
                                            color: tx.type === 'EARN' ? '#27ae60' : (tx.cashbackUsed > 0 ? '#e67e22' : '#e74c3c')
                                        }}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: tx.points > 0 ? '#27ae60' : '#e74c3c' }}>
                                            {tx.points > 0 ? '+' : ''}{tx.points} pts
                                        </div>
                                        {tx.amount && (
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                                ${tx.amount.toFixed(2)} spent
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
