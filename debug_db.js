const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const email = 'test@example.com'; // Use the email of the user trying to login
    const password = 'password123'; // The password they are using

    console.log(`Attempting login for: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log('User NOT found');
        return;
    }
    console.log('User found:', user.id);
    console.log('Stored Hash:', user.password);

    if (!user.password) {
        console.log('NO password set for user');
        return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
