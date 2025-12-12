import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const EMAIL = "admin@e-loyalty.com";
    const PASSWORD = "Admin123!"; // Clear, strong-ish password

    console.log(`🦸 Creating Super Admin: ${EMAIL}`);

    // 1. Ensure Role Exists
    const role = await prisma.role.upsert({
        where: { name: 'SUPER ADMIN' },
        update: {},
        create: {
            name: 'SUPER ADMIN',
            description: 'Full System Access'
        }
    });

    // 2. Create/Update User
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const user = await prisma.user.upsert({
        where: { email: EMAIL },
        update: {
            password: hashedPassword,
            roleId: role.id,
            isSuspended: false,
            // Ensure they have a name
            name: "System Administrator"
        },
        create: {
            email: EMAIL,
            name: "System Administrator",
            password: hashedPassword,
            roleId: role.id,
            isSuspended: false
        }
    });

    console.log(`
    ✅ Super Admin Created Successfully!
    -----------------------------------
    📧 Email:    ${EMAIL}
    🔑 Password: ${PASSWORD}
    -----------------------------------
    (Please save these credentials)
    `);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
