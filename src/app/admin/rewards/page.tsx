import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import prisma from '@/lib/prisma';
import styles from '../admin.module.css';

async function getRewards() {
    return await prisma.reward.findMany({
        orderBy: { pointsCost: 'asc' }
    });
}

export default async function RewardsPage() {
    const rewards = await getRewards();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h1>Reward Management</h1>
                <Link href="/admin/rewards/new">
                    <Button>Add New Reward</Button>
                </Link>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Points Cost</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rewards.map((reward) => (
                            <tr key={reward.id}>
                                <td>{reward.name}</td>
                                <td>{reward.description}</td>
                                <td>{reward.pointsCost} pts</td>
                                <td>
                                    <span style={{
                                        color: reward.isActive ? 'green' : 'red',
                                        fontWeight: 500
                                    }}>
                                        {reward.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
