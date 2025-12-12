
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing FIXED Funnel Query (groupBy)...");

        // Optimized Funnel (groupBy is faster and avoids nested select crash)
        const userTransactionCounts = await prisma.loyaltyTransaction.groupBy({
            by: ['memberProfileId'],
            where: { type: 'EARN' },
            _count: { id: true }
        });

        console.log("Query Success! Result count:", userTransactionCounts.length);
        if (userTransactionCounts.length > 0) console.log("Sample:", userTransactionCounts[0]);

        const activeUsers = userTransactionCounts.length; // Users with >= 1 transaction
        const loyalUsers = userTransactionCounts.filter(u => u._count.id > 1).length; // Users with > 1 transaction

        console.log("Calculated:", { activeUsers, loyalUsers });

    } catch (e) {
        console.error("FIX FAILED:");
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
