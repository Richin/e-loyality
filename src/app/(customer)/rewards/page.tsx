import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Card } from '@/components/ui/Card';

export default async function MyRewardsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        redirect('/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberProfile: {
                include: {
                    redemptions: {
                        include: { reward: true },
                        orderBy: { redeemedAt: 'desc' }
                    }
                }
            }
        }
    });

    if (!user || !user.memberProfile) {
        return <div>Profile not found</div>;
    }

    const redemptions = user.memberProfile.redemptions;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Rewards</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {redemptions.length === 0 ? (
                    <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>No rewards redeemed yet.</p>
                ) : (
                    redemptions.map((redemption) => (
                        <Card key={redemption.id}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontWeight: 'bold' }}>{redemption.reward.name}</h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        background: redemption.status === 'USED' ? '#eee' : '#e8f5e9',
                                        color: redemption.status === 'USED' ? '#999' : '#27ae60',
                                        fontWeight: 'bold'
                                    }}>
                                        {redemption.status}
                                    </span>
                                </div>

                                {redemption.code && (
                                    <div style={{
                                        background: '#f8f9fa',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        marginBottom: '1rem',
                                        border: '1px dashed #ccc'
                                    }}>
                                        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Voucher Code</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px' }}>
                                            {redemption.code}
                                        </div>
                                    </div>
                                )}

                                {redemption.isGift && (
                                    <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#8e44ad' }}>
                                        🎁 Gifted to: {redemption.giftRecipientEmail}
                                    </div>
                                )}

                                <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#999' }}>
                                    Redeemed on {new Date(redemption.redeemedAt).toLocaleDateString()}
                                </div>

                                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#555' }}>
                                    <strong>How to use:</strong>
                                    <p style={{ margin: '0.25rem 0' }}>{redemption.reward.terms || 'Show this code at checkout to redeem.'}</p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
