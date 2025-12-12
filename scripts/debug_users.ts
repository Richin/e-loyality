
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log(`Total users found: ${userCount}`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                select: { email: true, role: { select: { name: true } } }
            });
            console.log('Users:', JSON.stringify(users, null, 2));
        } else {
            console.log('No users found in the database.');
        }
    } catch (e) {
        console.error('Error connecting to database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
