import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfMonth, subMonths } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    try {
        // 1. Transaction Stats
        const totalTransactions = await prisma.loyaltyTransaction.count({
            where: { storeId }
        });

        const totalRevenue = await prisma.loyaltyTransaction.aggregate({
            where: { storeId, type: 'EARN' },
            _sum: { amount: true }
        });

        const totalPointsIssued = await prisma.loyaltyTransaction.aggregate({
            where: { storeId, type: 'EARN' },
            _sum: { points: true }
        });

        // 2. Redemptions
        const totalRedemptions = await prisma.redemption.count({
            where: { storeId }
        });

        // 3. Top Staff
        // Note: Transaction doesn't log userId yet, but assuming future link. 
        // For now, return staff list count.
        const staffCount = await prisma.storeStaff.count({ where: { storeId } });

        return NextResponse.json({
            transactions: totalTransactions,
            revenue: totalRevenue._sum.amount || 0,
            pointsIssued: totalPointsIssued._sum.points || 0,
            redemptions: totalRedemptions,
            staffCount
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
