
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing FIXED User Count Query...");

        // Fix: Use correct relation syntax + fallback for no role (regular user)
        const totalUsers = await prisma.user.count({
            where: {
                OR: [
                    { role: { name: 'USER' } },
                    { roleId: null }
                ]
            }
        });

        console.log("Query Success! Total Users:", totalUsers);

    } catch (e) {
        console.error("FIX FAILED:");
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
