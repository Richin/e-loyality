import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Starting Role Repair...");

    // 1. Ensure Roles Exist
    const roles = ["SUPER ADMIN", "ADMIN", "MANAGER", "SUPPORT", "USER"];

    for (const name of roles) {
        await prisma.role.upsert({
            where: { name },
            update: {},
            create: { name, description: `System Role: ${name}` }
        });
        console.log(`✅ Role ensured: ${name}`);
    }

    // 2. Fetch Super Admin Role
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER ADMIN' } });
    if (!superAdminRole) throw new Error("Failed to create Super Admin Role");

    // 3. Find Users without Roles (or just all users to be safe if count is low)
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    if (users.length > 0) {
        // Assign SUPER ADMIN to the FIRST user found (usually the creator)
        const firstUser = users[0];

        await prisma.user.update({
            where: { id: firstUser.id },
            data: { roleId: superAdminRole.id }
        });

        console.log(`👑 ASSIGNED 'SUPER ADMIN' TO: ${firstUser.email} (${firstUser.name})`);

        // Optional: Assign ADMIN to others? No, saftey first.
    } else {
        console.log("⚠️ No users found in database to assign roles to.");
    }

    console.log("🚀 Role Repair Complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
