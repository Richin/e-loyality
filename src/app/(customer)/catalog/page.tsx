import React from 'react';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import RewardList from './RewardList';
import styles from './catalog.module.css';

async function getRewards() {
    return await prisma.reward.findMany({
        where: { isActive: true },
        orderBy: { pointsCost: 'asc' },
    });
}

async function getUserPoints(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { memberProfile: true },
    });
    return user?.memberProfile?.pointsBalance || 0;
}

export default async function CatalogPage() {
    const session = await getServerSession(authOptions);
    const rewards = await getRewards();
    const userPoints = session?.user?.email ? await getUserPoints(session.user.email) : 0;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Rewards Catalog</h1>
                <p className={styles.subtitle}>Redeem your hard-earned points for exclusive rewards</p>
                <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                    Your Balance: <span style={{ color: 'var(--primary)' }}>{userPoints} pts</span>
                </div>
            </header>

            <RewardList rewards={rewards} userPoints={userPoints} />
        </div>
    );
}
