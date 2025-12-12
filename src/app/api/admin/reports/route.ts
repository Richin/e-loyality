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
        // 1. Active vs Inactive (Based on Suspended Status + Last Visit > 90 days?)
        // Let's use Suspended for hard inactive, and maybe lastVisit for "Dormant"
        const activeCount = await prisma.user.count({ where: { isSuspended: false } });
        const suspendedCount = await prisma.user.count({ where: { isSuspended: true } });

        // 2. Current Tier Distribution
        const tiersGrouped = await prisma.memberProfile.groupBy({
            by: ['currentTierId'],
            _count: { currentTierId: true }
        });

        const tierStats = [];
        for (const t of tiersGrouped) {
            if (t.currentTierId) { // Skip null tiers
                const tier = await prisma.tier.findUnique({ where: { id: t.currentTierId } });
                if (tier) tierStats.push({ name: tier.name, count: t._count.currentTierId });
            }
        }

        // 3. High Value Customers (RFM Analysis - VIP Segment)
        const highValue = await prisma.memberProfile.findMany({
            where: { segment: 'VIP' },
            include: { user: { select: { name: true, email: true } }, tier: true },
            orderBy: { clvValue: 'desc' },
            take: 20
        });

        // 4. Churn Risk List (RFM Analysis - AT_RISK or CHURNED)
        const churnRisk = await prisma.memberProfile.findMany({
            where: { segment: { in: ['AT_RISK', 'CHURNED'] } },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { lastVisitDate: 'asc' }, // Longest time since visit
            take: 20
        });

        // 5. Top CLV Customers
        const topClv = await prisma.memberProfile.findMany({
            orderBy: { clvValue: 'desc' },
            include: { user: { select: { name: true, email: true } } },
            take: 20
        });

        // 6. Tier Movement (Recent Manual Changes from Audit Log)
        const tierChanges = await prisma.auditLog.findMany({
            where: { action: 'FORCE_TIER' },
            include: { admin: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return NextResponse.json({
            statusStats: { active: activeCount, suspended: suspendedCount },
            tierStats,
            highValue: highValue.map(p => ({
                id: p.id, name: p.user.name, email: p.user.email, tier: p.tier?.name, clv: p.clvValue, balance: p.pointsBalance
            })),
            churnRisk: churnRisk.map(p => ({
                id: p.id, name: p.user.name, email: p.user.email, segment: p.segment, lastVisit: p.lastVisitDate
            })),
            topClv: topClv.map(p => ({
                id: p.id, name: p.user.name, clv: p.clvValue
            })),
            tierChanges
        });

    } catch (error: any) {
        console.error('Reports Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
