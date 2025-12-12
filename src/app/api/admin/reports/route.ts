import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // --- EXISTING STATS ---
        const activeCount = await prisma.user.count({ where: { isSuspended: false } });
        const suspendedCount = await prisma.user.count({ where: { isSuspended: true } });

        // --- POINTS HEALTH & BREAKAGE ---
        const totalIssuedAgg = await prisma.loyaltyTransaction.aggregate({
            where: { type: { in: ['EARN', 'BONUS', 'ADJUSTMENT_ADD'] } },
            _sum: { points: true }
        });
        const totalIssued = totalIssuedAgg._sum.points || 0;

        const totalRedeemedAgg = await prisma.loyaltyTransaction.aggregate({
            where: { type: 'REDEEM' },
            _sum: { points: true }
        });
        const totalRedeemed = Math.abs(totalRedeemedAgg._sum.points || 0);

        const totalExpiredAgg = await prisma.loyaltyTransaction.aggregate({
            where: { type: 'EXPIRE' },
            _sum: { points: true }
        });
        const totalExpired = Math.abs(totalExpiredAgg._sum.points || 0);

        const redemptionRate = totalIssued > 0 ? (totalRedeemed / totalIssued) : 0;
        const breakageRate = Math.max(0, 1 - redemptionRate);

        // --- TIER DATA ---
        const tiersGrouped = await prisma.memberProfile.groupBy({
            by: ['currentTierId'],
            _count: { currentTierId: true }
        });

        const tierStats = [];
        for (const t of tiersGrouped) {
            if (t.currentTierId) {
                const tier = await prisma.tier.findUnique({ where: { id: t.currentTierId } });
                if (tier) tierStats.push({ name: tier.name, count: t._count.currentTierId });
            }
        }

        // Tier Benefits Usage (Proxy: Redemptions by Tier)
        const tierUsageRaw = await prisma.redemption.findMany({
            include: { memberProfile: { select: { currentTierId: true } } }
        });

        const tierUsageMap: Record<string, number> = {};
        for (const r of tierUsageRaw) {
            const tId = r.memberProfile.currentTierId || 'No Tier';
            tierUsageMap[tId] = (tierUsageMap[tId] || 0) + 1;
        }

        const tierUsage = [];
        for (const [tId, count] of Object.entries(tierUsageMap)) {
            if (tId === 'No Tier') {
                tierUsage.push({ name: 'No Tier', count });
            } else {
                const tName = await prisma.tier.findUnique({ where: { id: tId } });
                if (tName) tierUsage.push({ name: tName.name, count });
            }
        }

        // --- LISTS (RFM) ---
        const highValue = await prisma.memberProfile.findMany({
            where: { segment: 'VIP' },
            include: { user: { select: { name: true, email: true } }, tier: true },
            orderBy: { clvValue: 'desc' },
            take: 20
        });

        const churnRisk = await prisma.memberProfile.findMany({
            where: { segment: { in: ['AT_RISK', 'CHURNED'] } },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { lastVisitDate: 'asc' },
            take: 20
        });

        const topClv = await prisma.memberProfile.findMany({
            orderBy: { clvValue: 'desc' },
            include: { user: { select: { name: true, email: true } } },
            take: 20
        });

        const tierChanges = await prisma.auditLog.findMany({
            where: { action: 'FORCE_TIER' },
            include: { admin: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // --- REWARDS ANALYTICS ---

        // 1. Top Redeemed Rewards
        const redemptionsGrouped = await prisma.redemption.groupBy({
            by: ['rewardId'],
            _count: { rewardId: true },
            orderBy: { _count: { rewardId: 'desc' } },
            take: 5
        });

        const topRewards = [];
        for (const r of redemptionsGrouped) {
            const reward = await prisma.reward.findUnique({ where: { id: r.rewardId } });
            if (reward) topRewards.push({ name: reward.name, count: r._count.rewardId });
        }

        // 2. Unused/Open Vouchers
        const unusedVouchersCount = await prisma.redemption.count({
            where: { status: 'APPROVED', usedAt: null }
        });

        // 3. Low Inventory
        const lowInventoryRewards = await prisma.reward.findMany({
            where: { type: 'PHYSICAL', inventory: { lt: 10 } },
            select: { name: true, inventory: true }
        });

        // 4. Fraud Alerts (> 3 redemptions in 24h)
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);

        const recentRedemptions = await prisma.redemption.groupBy({
            by: ['memberProfileId'],
            where: { redeemedAt: { gte: oneDayAgo } },
            _count: { id: true },
            having: { id: { _count: { gt: 3 } } }
        });

        const fraudAlerts = [];
        for (const r of recentRedemptions) {
            const profile = await prisma.memberProfile.findUnique({
                where: { id: r.memberProfileId },
                include: { user: { select: { name: true, email: true } } }
            });
            if (profile) fraudAlerts.push({ name: profile.user.name, email: profile.user.email, count: r._count.id });
        }


        return NextResponse.json({
            statusStats: { active: activeCount, suspended: suspendedCount },
            pointsStats: { totalIssued, totalRedeemed, totalExpired, breakageRate },
            tierStats,
            tierUsage,
            highValue: highValue.map(p => ({
                id: p.id, name: p.user.name, email: p.user.email, tier: p.tier?.name, clv: p.clvValue, balance: p.pointsBalance
            })),
            churnRisk: churnRisk.map(p => ({
                id: p.id, name: p.user.name, email: p.user.email, segment: p.segment, lastVisit: p.lastVisitDate
            })),
            topClv: topClv.map(p => ({
                id: p.id, name: p.user.name, clv: p.clvValue
            })),
            tierChanges,
            topRewards, // Rewards Stats
            unusedVouchersCount,
            lowInventoryRewards,
            fraudAlerts
        });

    } catch (error: any) {
        console.error('Reports Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
