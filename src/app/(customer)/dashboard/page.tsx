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
            include: { memberProfile: true }
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
                tier={profile.currentTier}
                points={profile.pointsBalance}
            />

            <h2 style={{ marginBottom: '1rem' }}>My Wallet</h2>
            <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                {/* Points Card */}
                <Card title="Points">
                    <div className={styles.pointsValue}>
                        {profile.pointsBalance} <span className={styles.pointsLabel}>pts</span>
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
                        <Link href="/profile" style={{ width: '100%' }}>
                            <Button variant="outline" fullWidth>My Profile</Button>
                        </Link>
                        <Link href="/referrals" style={{ width: '100%' }}>
                            <Button variant="outline" fullWidth>Refer & Earn</Button>
                        </Link>
                        <Link href="/history" style={{ width: '100%' }}>
                            <Button variant="ghost" fullWidth>History</Button>
                        </Link>
                    </div>
                </Card>

                {/* Recent Activity Placeholder */}
                <Card title="Recent Activity" className={styles.wideCard}>
                    <div className={styles.emptyState}>
                        <p>Check your recent transactions and point earnings.</p>
                        <Link href="/history"><Button variant="ghost" size="sm">View Full History</Button></Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
