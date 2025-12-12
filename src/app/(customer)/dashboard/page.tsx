import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Card } from '@/components/ui/Card';
import DigitalCard from '@/components/DigitalCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import styles from './dashboard.module.css';

async function getMemberProfile(userId: string) {
    return await prisma.memberProfile.findUnique({
        where: { userId },
    });
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    // The session.user object might not have the ID if we didn't add it to the JWT/Session callback correctly.
    // We need to fetch the user by email if ID is missing (which it is currently in our basic setup)
    let user = null;
    if (session.user.email) {
        user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberProfile: {
                    include: { tier: true }
                }
            }
        });
    }

    if (!user) {
        return <div>User not found. Please contact support.</div>;
    }

    const profile = user.memberProfile;

    if (!profile) {
        // Create profile if missing (edge case for manual DB inserts)
        return (
            <div className="container" style={{ padding: '2rem' }}>
                <h1>Welcome, {user.name}</h1>
                <p>Your member profile is being set up. Please refresh in a moment.</p>
            </div>
        )
    }

    // Calculate Tier Progress
    const nextTier = user.role === 'ADMIN' ? null : ( // Simplified check
        profile.pointsBalance < 1000 ? { name: 'Silver', threshold: 1000 } :
            profile.pointsBalance < 5000 ? { name: 'Gold', threshold: 5000 } : null
    );

    const progress = nextTier ? Math.min((profile.pointsBalance / nextTier.threshold) * 100, 100) : 100;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.welcome}>Welcome back, {user.name}</h1>
                <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            {/* Digital Membership Card */}
            <DigitalCard
                name={user.name || 'Valued Member'}
                memberId={profile.id}
                tier={profile.tier?.name || 'Bronze'}
                points={profile.pointsBalance}
            />

            {/* Tier Progress */}
            {nextTier && (
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <span>Progress to {nextTier.name}</span>
                        <span>{profile.pointsBalance} / {nextTier.threshold} pts</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#3498db', transition: 'width 0.3s ease' }} />
                    </div>
                </div>
            )}

            <h2 style={{ marginBottom: '1rem' }}>My Wallet</h2>
            <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                {/* Points Card */}
                <Card title="Points Balance">
                    <div className={styles.pointsValue}>
                        {profile.pointsBalance} <span className={styles.pointsLabel}>pts</span>
                    </div>
                    <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#f39c12' }}>Pending:</span>
                            <span>{profile.pendingPoints}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#e74c3c' }}>Expired:</span>
                            <span>{profile.expiredPoints}</span>
                        </div>
                        {profile.pointsExpiryDate && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#7f8c8d' }}>
                                Next expiry: {new Date(profile.pointsExpiryDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Cashback Card */}
                <Card title="Cashback">
                    <div className={styles.pointsValue} style={{ color: '#27ae60' }}>
                        ${profile.cashbackBalance?.toFixed(2) || '0.00'}
                    </div>
                    <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.8rem' }}>Available to spend</p>
                </Card>

                {/* Prepaid Card */}
                <Card title="Prepaid">
                    <div className={styles.pointsValue} style={{ color: '#8e44ad' }}>
                        ${profile.prepaidBalance?.toFixed(2) || '0.00'}
                    </div>
                    <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.8rem' }}>Top up in store</p>
                </Card>
            </div>

            <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
            <div className={styles.grid}>

                {/* Quick Actions Card */}
                <Card title="Quick Actions">
                    <div className={styles.actions}>
                        <Link href="/catalog" style={{ width: '100%' }}>
                            <Button fullWidth>Redeem Rewards</Button>
                        </Link>
                        <Link href="/referrals" style={{ width: '100%' }}>
                            <Button variant="outline" fullWidth>Refer & Earn</Button>
                        </Link>
                        <Link href="/history" style={{ width: '100%' }}>
                            <Button variant="ghost" fullWidth>History</Button>
                        </Link>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card title="Recent Activity" className={styles.wideCard}>
                    <div className={styles.emptyState}>
                        <div style={{ width: '100%', textAlign: 'left' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>Initial Bonus</td>
                                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', textAlign: 'right', color: '#27ae60' }}>+100 pts</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>Welcome Gift</td>
                                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', textAlign: 'right', color: '#27ae60' }}>+50 pts</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <Link href="/history"><Button variant="ghost" size="sm">View Full History</Button></Link>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
