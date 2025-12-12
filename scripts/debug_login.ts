
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = "admin@e-loyalty.com";
    const password = "Admin123!";

    console.log(`Checking login for: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log("❌ User not found in DB");
        return;
    }

    console.log("User found:", user.id);
    console.log("Stored Hash:", user.password);

    if (!user.password) {
        console.log("❌ No password stored");
        return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log(`Password '${password}' valid? ${isValid}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
