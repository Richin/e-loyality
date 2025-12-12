
import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardView from '@/components/customer/DashboardView';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            role: true,
            memberProfile: {
                include: {
                    tier: { select: { name: true } },
                },
            },
        },
    });

    if (!user) {
        return <Typography>User not found. Please contact support.</Typography>;
    }

    const profile = user.memberProfile;

    if (!profile) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h4">Welcome, {user.name}</Typography>
                <Typography>Your member profile is being set up. Please refresh in a moment.</Typography>
            </Box>
        );
    }

    const profileId = profile.id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [recentTransactions, monthlyTransactions, featuredRewards, openTickets] = await Promise.all([
        prisma.loyaltyTransaction.findMany({
            where: { memberProfileId: profileId },
            orderBy: { createdAt: 'desc' },
            take: 6,
            select: {
                id: true,
                description: true,
                type: true,
                points: true,
                createdAt: true,
                store: { select: { name: true } },
            },
        }),
        prisma.loyaltyTransaction.findMany({
            where: {
                memberProfileId: profileId,
                createdAt: { gte: monthStart },
            },
            select: { points: true, type: true },
        }),
        prisma.reward.findMany({
            where: { isActive: true },
            orderBy: { pointsCost: 'asc' },
            take: 3,
            select: {
                id: true,
                name: true,
                description: true,
                pointsCost: true,
                category: true,
            },
        }),
        prisma.supportTicket.count({
            where: {
                memberProfileId: profileId,
                status: { not: 'CLOSED' },
            },
        }),
    ]);

    type MonthlyTransaction = (typeof monthlyTransactions)[number];
    type RecentTransaction = (typeof recentTransactions)[number];
    type FeaturedReward = (typeof featuredRewards)[number];

    const monthEarned = monthlyTransactions
        .filter((transaction: MonthlyTransaction) => transaction.type === 'EARN')
        .reduce((total: number, transaction: MonthlyTransaction) => total + transaction.points, 0);

    const monthRedeemed = monthlyTransactions
        .filter((transaction: MonthlyTransaction) => transaction.type === 'REDEEM')
        .reduce((total: number, transaction: MonthlyTransaction) => total + Math.abs(transaction.points), 0);

    const netPoints = monthEarned - monthRedeemed;

    const safeUser = {
        name: user.name,
        email: user.email,
        role: user.role?.name ?? (session.user as any)?.role ?? 'MEMBER',
    };

    const safeProfile = {
        id: profile.id,
        pointsBalance: profile.pointsBalance,
        pendingPoints: profile.pendingPoints,
        expiredPoints: profile.expiredPoints,
        pointsExpiryDate: profile.pointsExpiryDate ? profile.pointsExpiryDate.toISOString() : null,
        cashbackBalance: profile.cashbackBalance ?? 0,
        prepaidBalance: profile.prepaidBalance ?? 0,
        currentStreak: profile.currentStreak ?? 0,
        lastVisitDate: profile.lastVisitDate ? profile.lastVisitDate.toISOString() : null,
        tier: profile.tier ? { name: profile.tier.name } : null,
    };

    const safeActivity = recentTransactions.map((transaction: RecentTransaction) => ({
        id: transaction.id,
        description: transaction.description,
        type: transaction.type,
        points: transaction.points,
        createdAt: transaction.createdAt.toISOString(),
        storeName: transaction.store?.name ?? null,
    }));

    const safeRewards = featuredRewards.map((reward: FeaturedReward) => ({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        pointsCost: reward.pointsCost,
        category: reward.category,
    }));

    return (
        <DashboardView
            user={safeUser}
            profile={safeProfile}
            recentActivity={safeActivity}
            featuredRewards={safeRewards}
            stats={{
                monthEarned,
                monthRedeemed,
                netPoints,
                openTickets,
            }}
        />
    );
}
