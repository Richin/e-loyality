import React from 'react';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import styles from './history.module.css';

async function getTransactions(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            memberProfile: {
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });
    return user?.memberProfile?.transactions || [];
}

export default async function HistoryPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        redirect('/auth/signin');
    }

    const transactions = await getTransactions(session.user.email);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Transaction History</h1>
            </header>

            <div className={styles.tableContainer}>
                {transactions.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td>
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>{tx.type}</td>
                                    <td>{tx.description}</td>
                                    <td className={tx.points > 0 ? styles.positive : styles.negative}>
                                        {tx.points > 0 ? '+' : ''}{tx.points}
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
