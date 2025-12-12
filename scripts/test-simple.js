const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting notification test...');

    // 1. Find a user
    const user = await prisma.user.findFirst({
        include: { memberProfile: true }
    });

    if (!user || !user.memberProfile) {
        console.log('No user found to test with.');
        return;
    }

    console.log(`Found user: ${user.email}`);

    // 2. Insert Notification manually
    const note = await prisma.notification.create({
        data: {
            memberProfileId: user.memberProfile.id,
            type: 'SYSTEM',
            title: 'Manual Test Validated',
            message: 'If you see this, the database connection is working perfectly.',
            isRead: false
        }
    });

    console.log('✅ Success! Notification inserted:', note.id);

    // 3. Verify it exists
    const check = await prisma.notification.findUnique({ where: { id: note.id } });
    if (check) {
        console.log('✅ Verification: Record found in DB.');
    }
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
