import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, subDays, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Peak Shopping Hours (Heatmap Data)
        // We need to group by Hour. Prisma doesn't natively support Date extraction in groupBy easily across DBs without raw query.
        // For MySQL we can use raw query or just fetch timestamps and process in JS (if dataset < 10k items, JS is fine).
        // Let's use raw query for efficiency if possible, or simple finding.
        // Given this is MVP, let's fetch last 1000 transactions and process.

        const recentTx = await prisma.loyaltyTransaction.findMany({
            where: { type: 'EARN' },
            select: { createdAt: true, points: true, amount: true },
            orderBy: { createdAt: 'desc' },
            take: 2000
        });

        const hourDistribution = new Array(24).fill(0);
        const dayDistribution = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        recentTx.forEach(tx => {
            const date = new Date(tx.createdAt);
            const hour = date.getHours();
            hourDistribution[hour]++;
            dayDistribution[days[date.getDay()] as keyof typeof dayDistribution]++;
        });

        // 2. Trend Lines (Revenue & Points - Last 30 Days)
        const thirtyDaysAgo = subDays(new Date(), 30);
        const trendsRaw = await prisma.loyaltyTransaction.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                type: { in: ['EARN', 'REDEEM'] }
            },
            orderBy: { createdAt: 'asc' }
        });

        const trendsMap = new Map();
        trendsRaw.forEach(tx => {
            const day = format(new Date(tx.createdAt), 'MM/dd');
            if (!trendsMap.has(day)) trendsMap.set(day, { date: day, earn: 0, redeem: 0, amount: 0 });
            const entry = trendsMap.get(day);
            if (tx.type === 'EARN') {
                entry.earn += tx.points;
                entry.amount += (tx.amount || 0);
            } else if (tx.type === 'REDEEM') {
                entry.redeem += Math.abs(tx.points);
            }
        });
        const trends = Array.from(trendsMap.values());

        // 3. Funnel Analysis
        const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
        const profilesRaw = await prisma.memberProfile.findMany({
            select: { _count: { select: { transactions: { where: { type: 'EARN' } } } } }
        });

        const activeUsers = profilesRaw.filter(p => p._count.transactions > 0).length;
        const loyalUsers = profilesRaw.filter(p => p._count.transactions > 1).length; // >1 purchase

        // 4. RFM & Churn Prediction (Simplified)
        // In a real app, this would be a complex model. Here we segment by "Days since last visit".
        const churnRiskCount = await prisma.memberProfile.count({
            where: { lastVisitDate: { lt: subDays(new Date(), 60) } } // Inactive > 60 days
        });

        // Mock Churn Probability distribution for visualization
        const churnDistribution = [
            { name: 'Low Risk', value: totalUsers - churnRiskCount },
            { name: 'High Risk', value: churnRiskCount }
        ];

        return NextResponse.json({
            peakHours: hourDistribution.map((count, hour) => ({ hour: `${hour}:00`, count })),
            trends,
            funnel: [
                { stage: 'Total Users', count: totalUsers },
                { stage: 'First Purchase', count: activeUsers },
                { stage: 'Repeat Customer', count: loyalUsers }
            ],
            churn: churnDistribution
        });

    } catch (error: any) {
        console.error('Insights Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
