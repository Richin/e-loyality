import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Points Liability
        // Sum of all current loyalty points held by members
        const pointsAgg = await prisma.memberProfile.aggregate({
            _sum: { pointsBalance: true }
        });
        const totalPoints = pointsAgg._sum.pointsBalance || 0;

        // Fetch Point Value setting, default to $0.01 if not set
        const pointValueSetting = await prisma.programSetting.findUnique({
            where: { settingKey: 'point_value' }
        });
        const pointValue = pointValueSetting ? parseFloat(pointValueSetting.value) : 0.01;
        const liabilityValue = totalPoints * pointValue;

        // 2. Wallet Liability
        // Explicit cash value stored in wallets
        const walletAgg = await prisma.memberProfile.aggregate({
            _sum: { cashbackBalance: true, prepaidBalance: true }
        });
        const cashbackLiability = walletAgg._sum.cashbackBalance || 0;
        const prepaidLiability = walletAgg._sum.prepaidBalance || 0;

        // 3. Breakage (Revenue from Expiration)
        // Sum of all expired points
        const expiredAgg = await prisma.memberProfile.aggregate({
            _sum: { expiredPoints: true }
        });
        const breakagePoints = expiredAgg._sum.expiredPoints || 0;
        const breakageValue = breakagePoints * pointValue;

        // 4. Reward Costs
        // Sum of costPrice for all FULFILLED or APPROVED redemptions
        // Joining Redemption -> Reward to get costPrice
        // Prisma aggregation on related fields is tricky, fetching raw or iterating.
        // For scale, use raw query or independent aggregates. 
        // Let's fetch Redemptions with Reward cost included.
        const redemptions = await prisma.redemption.findMany({
            where: { status: { in: ['APPROVED', 'FULFILLED'] } },
            include: { reward: { select: { costPrice: true } } }
        });

        const totalRewardCost = redemptions.reduce((sum, r) => sum + (r.reward.costPrice || 0), 0);

        return NextResponse.json({
            pointsLiability: { points: totalPoints, value: liabilityValue },
            walletLiability: { cashback: cashbackLiability, prepaid: prepaidLiability, total: cashbackLiability + prepaidLiability },
            breakage: { points: breakagePoints, value: breakageValue },
            rewardCosts: totalRewardCost,
            currency: '$' // Hardcoded for now, ideal from settings
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
