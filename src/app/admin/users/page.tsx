import React from 'react';
import prisma from '@/lib/prisma';
import styles from '../admin.module.css';

async function getUsers() {
    return await prisma.user.findMany({
        include: {
            memberProfile: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div>
            <h1>User Management</h1>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Tier</th>
                            <th>Points</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name || 'N/A'}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span style={{
                                        background: user.role === 'ADMIN' ? '#e3f2fd' : '#f5f5f5',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{user.memberProfile?.currentTier || '-'}</td>
                                <td style={{ fontWeight: 'bold' }}>{user.memberProfile?.pointsBalance ?? 0}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
