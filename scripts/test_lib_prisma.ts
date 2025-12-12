
import prisma from '../src/lib/prisma';

async function main() {
    console.log("Checking DB connection via src/lib/prisma...");
    try {
        const user = await prisma.user.findFirst({
            where: { email: 'admin@e-loyalty.com' }
        });
        if (user) {
            console.log("✅ Found user via lib/prisma:", user.email);
        } else {
            console.log("❌ User not found via lib/prisma");
        }
    } catch (e) {
        console.error("❌ Error with lib/prisma:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
