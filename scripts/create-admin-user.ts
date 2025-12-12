import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@eloyalty.com';
    const password = 'admin123';
    const name = 'System Administrator';

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert: Create if new, update role if exists
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            password: hashedPassword // Reset password just in case
        },
        create: {
            email,
            name,
            password: hashedPassword,
            role: 'ADMIN',
            memberProfile: {
                create: {
                    pointsBalance: 999999, // Infinite points for testing
                    currentTierId: undefined // Logic will handle tier
                }
            }
        }
    });

    console.log(`
    ✅ Admin User Created!
    Email: ${user.email}
    Password: ${password}
    Role: ${user.role}
    `);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
