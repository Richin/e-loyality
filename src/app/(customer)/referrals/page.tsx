import React from 'react';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ReferralDashboard from './ReferralDashboard';

export default async function ReferralsPage() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) return <div>Access Denied (No Session)</div>;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberProfile: {
                    include: {
                        referrals: { include: { user: true } },
                        transactions: { where: { type: 'REFERRAL_BONUS' } }
                    }
                }
            }
        });

        if (!user) return <div>User not found in database</div>;
        if (!user.memberProfile) return <div>Member Profile not found</div>;

        const totalEarned = user.memberProfile.transactions.reduce((acc, curr) => acc + curr.points, 0);

        return (
            <div className="container" style={{ padding: '2rem 1rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Referral Program</h1>
                <ReferralDashboard
                    referralCode={user.memberProfile.referralCode || ''}
                    referrals={user.memberProfile.referrals}
                    totalEarned={totalEarned}
                />
            </div>
        );
    } catch (error: any) {
        return (
            <div className="container" style={{ padding: '2rem', color: 'red' }}>
                <h1>Error Loading Page</h1>
                <pre>{error.message}</pre>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }
}
