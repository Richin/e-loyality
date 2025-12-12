
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { subDays, format } = require('date-fns');

async function main() {
    try {
        console.log("1. Testing recentTx query...");
        const recentTx = await prisma.loyaltyTransaction.findMany({
            where: { type: 'EARN' },
            select: { createdAt: true, points: true, amount: true },
            orderBy: { createdAt: 'desc' },
            take: 2000
        });
        console.log("RecentTx count:", recentTx.length);

        console.log("2. Processing Heatmap...");
        const hourDistribution = new Array(24).fill(0);
        const dayDistribution = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        recentTx.forEach(tx => {
            const date = new Date(tx.createdAt);
            const hour = date.getHours();
            hourDistribution[hour]++;
            dayDistribution[days[date.getDay()]];
        });
        console.log("Heatmap done.");

        console.log("3. Testing Trends Query...");
        const thirtyDaysAgo = subDays(new Date(), 30);
        const trendsRaw = await prisma.loyaltyTransaction.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                type: { in: ['EARN', 'REDEEM'] }
            },
            orderBy: { createdAt: 'asc' }
        });
        console.log("TrendsRaw count:", trendsRaw.length);

        console.log("4. Processing Trends...");
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
        console.log("Trends done.");

        console.log("5. Testing Funnel Analysis...");
        const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
        console.log("Total Users:", totalUsers);

        // THIS IS THE SUSPICIOUS PART
        const profilesRaw = await prisma.memberProfile.findMany({
            select: { _count: { select: { transactions: { where: { type: 'EARN' } } } } }
        });
        console.log("Profiles returned:", profilesRaw.length);
        if (profilesRaw.length > 0) {
            console.log("First profile keys:", Object.keys(profilesRaw[0]));
            console.log("First profile _count:", profilesRaw[0]._count);
        }

        const activeUsers = profilesRaw.filter(p => p._count.transactions > 0).length;
        const loyalUsers = profilesRaw.filter(p => p._count.transactions > 1).length;
        console.log("Funnel Done:", { activeUsers, loyalUsers });

        console.log("6. Testing Churn Query...");
        const churnRiskCount = await prisma.memberProfile.count({
            where: { lastVisitDate: { lt: subDays(new Date(), 60) } }
        });
        console.log("Churn Count:", churnRiskCount);

    } catch (e) {
        console.error("CRASHED AT STEP:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
