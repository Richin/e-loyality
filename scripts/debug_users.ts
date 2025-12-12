import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Debugging User State...");

    const users = await prisma.user.findMany({
        include: { role: true }
    });

    console.log(`Found ${users.length} users:`);
    console.table(users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role?.name || 'NULL (No Role)',
        hasPassword: !!u.password,
        isSuspended: u.isSuspended
    })));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
