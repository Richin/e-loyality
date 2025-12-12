import React from 'react';
import prisma from '@/lib/prisma';
import styles from './admin.module.css';

async function getStats() {
    const totalUsers = await prisma.user.count();
    const transactions = await prisma.loyaltyTransaction.findMany({
        where: { type: 'EARN' },
        select: { amount: true }
    });
    const totalRedemptions = await prisma.redemption.count();

    // Calculate total revenue from simulated purchases
    const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return {
        totalUsers,
        totalRevenue,
        totalRedemptions,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <h1>Dashboard Overview</h1>
            <p style={{ color: '#666' }}>Welcome to the admin control panel.</p>

            <div className={styles.grid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Users</div>
                    <div className={styles.statValue}>{stats.totalUsers}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Revenue</div>
                    <div className={styles.statValue}>${stats.totalRevenue.toLocaleString()}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Redemptions Claimed</div>
                    <div className={styles.statValue}>{stats.totalRedemptions}</div>
                </div>
            </div>
        </div>
    );
}
