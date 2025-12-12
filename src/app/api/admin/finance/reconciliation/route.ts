import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfMonth, subMonths, endOfMonth, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Generate last 6 months
        const months = [];
        for (let i = 0; i < 6; i++) {
            const date = subMonths(new Date(), i);
            months.push({
                start: startOfMonth(date),
                end: endOfMonth(date),
                label: format(date, 'MMM yyyy')
            });
        }

        const reconciliation = [];

        for (const month of months) {
            // 1. POS Revenue (Transactions of type EARN with amount)
            const revenueAgg = await prisma.loyaltyTransaction.aggregate({
                where: {
                    type: 'EARN',
                    createdAt: { gte: month.start, lte: month.end }
                },
                _sum: { amount: true, points: true }
            });

            // 2. Redemptions Value
            const redemptionAgg = await prisma.loyaltyTransaction.aggregate({
                where: {
                    type: 'REDEEM',
                    createdAt: { gte: month.start, lte: month.end }
                },
                _sum: { points: true } // Negative usually
            });

            // 3. Breakage (Approximate based on expiry date if possible, but we don't track *when* it expired in log effectively yet. 
            // We only have `expiredPoints` total on Profile. 
            // Phase 2 would require an `ExpirationLog`. For now return 0 or N/A).

            reconciliation.push({
                month: month.label,
                revenue: revenueAgg._sum.amount || 0,
                pointsIssued: revenueAgg._sum.points || 0,
                pointsRedeemed: Math.abs(redemptionAgg._sum.points || 0),
            });
        }

        return NextResponse.json(reconciliation);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
