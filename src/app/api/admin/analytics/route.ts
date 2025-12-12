import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { startOfMonth, subMonths } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    // Authorization Check
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role Check
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // 1. KPI Cards
        const totalMembers = await prisma.memberProfile.count();

        // Liability: Sum of all points held by users
        const liabilityAgg = await prisma.memberProfile.aggregate({
            _sum: { pointsBalance: true }
        });
        const totalPointsLiability = liabilityAgg._sum.pointsBalance || 0;
        const estFinancialLiability = totalPointsLiability * 0.01; // Assuming 1 pt = $0.01

        // 2. Growth (Signups)
        const startOfCurrentMonth = startOfMonth(new Date());
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const newSignups = await prisma.memberProfile.count({
            where: { createdAt: { gte: startOfCurrentMonth } }
        });

        const dailySignups = await prisma.memberProfile.count({
            where: { createdAt: { gte: startOfToday } }
        });

        // 3. Points Flow (Issued vs Redeemed)
        const transactionStats = await prisma.loyaltyTransaction.groupBy({
            by: ['type'],
            _sum: { points: true }
        });

        // Safe access to find results
        const earnedObj = transactionStats.find(t => t.type === 'EARN' || t.type === 'BONUS' || t.type === 'REFERRAL_BONUS'); // Group all positive? Actually type is usually specific. 
        // Let's rely on specific types or logic. In seed we used EARN/REDEEM.
        // Better: Query sums based on positive vs negative points if type isn't reliable, but type is safer.
        // For this demo let's grab specific known types.

        // Actually, simpler to just sum all positive vs negative points from DB directly?
        // groupBy is fine if we know the enum.

        const earned = transactionStats
            .filter(t => ['EARN', 'BONUS', 'REFERRAL_BONUS'].includes(t.type))
            .reduce((acc, curr) => acc + (curr._sum.points || 0), 0);

        const redeemed = transactionStats
            .filter(t => t.type === 'REDEEM')
            .reduce((acc, curr) => acc + (curr._sum.points || 0), 0);

        const pointsEarned = earned;
        const pointsRedeemed = Math.abs(redeemed);
        const redemptionRate = pointsEarned > 0 ? (pointsRedeemed / pointsEarned) * 100 : 0;

        // 4. Tier Distribution
        // Group by tierId first
        const tiersGrouped = await prisma.memberProfile.groupBy({
            by: ['currentTierId'],
            _count: { currentTierId: true }
        });

        const tierDistribution = [];
        for (const t of tiersGrouped) {
            if (!t.currentTierId) continue;
            const tierName = await prisma.tier.findUnique({ where: { id: t.currentTierId }, select: { name: true } });
            if (tierName) {
                tierDistribution.push({ name: tierName.name, count: t._count.currentTierId });
            }
        }
        // Fill in empty tiers if needed or just return what we have.

        // 5. Churn Indicators (Segments)
        const segments = await prisma.memberProfile.groupBy({
            by: ['segment'],
            _count: { segment: true }
        });
        const churnStats = segments.map(s => ({
            name: s.segment || 'Unknown',
            value: s._count.segment
        }));

        // 6. Top Rewards
        const topRewards = await prisma.redemption.groupBy({
            by: ['rewardId'],
            _count: { rewardId: true },
            orderBy: { _count: { rewardId: 'desc' } },
            take: 5
        });

        const topPerformingRewards = [];
        for (const item of topRewards) {
            const reward = await prisma.reward.findUnique({ where: { id: item.rewardId } });
            if (reward) {
                topPerformingRewards.push({
                    name: reward.name,
                    count: item._count.rewardId
                });
            }
        }

        return NextResponse.json({
            kpis: {
                totalMembers,
                newSignups,       // Monthly
                dailySignups,     // Daily
                totalPointsLiability,
                estFinancialLiability,
                redemptionRate
            },
            pointsFlow: {
                earned: pointsEarned,
                redeemed: pointsRedeemed
            },
            tierDistribution,
            churnStats,
            topPerformingRewards
        });

    } catch (error: any) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
