import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("🔐 Starting Password Reset...");

    // Find the SUPER ADMIN user
    const users = await prisma.user.findMany({
        where: {
            role: { name: 'SUPER ADMIN' }
        }
    });

    if (users.length === 0) {
        console.error("❌ No SUPER ADMIN found.");
        return;
    }

    const targetUser = users[0];
    const newPassword = "Password123!";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: targetUser.id },
        data: { password: hashedPassword }
    });

    console.log(`✅ Password Reset Successful for: ${targetUser.email}`);
    console.log(`🔑 New Password: ${newPassword}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
