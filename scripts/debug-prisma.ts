
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing suspicious query...");
        const profilesRaw = await prisma.memberProfile.findMany({
            select: { _count: { select: { transactions: { where: { type: 'EARN' } } } } }
        });
        console.log("Query success! Result:", profilesRaw.slice(0, 2));
    } catch (e) {
        console.error("Query FAILED:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
