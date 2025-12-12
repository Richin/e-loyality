import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address');
    process.exit(1);
}

async function main() {
    const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
    });
    console.log(`Updated user ${user.email} to Role: ${user.role}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
