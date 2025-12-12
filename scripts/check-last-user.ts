
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
    })

    if (!user) {
        console.log('No users found.')
        return
    }

    console.log('Latest User:', {
        email: user.email,
        id: user.id,
        hasPassword: !!user.password,
        passwordHash: user.password,
        createdAt: user.createdAt
    })

    if (user.password) {
        // Attempt to compare with 'password123' (test user)
        const matchesTest = await bcrypt.compare('password123', user.password)
        console.log('Matches "password123"?', matchesTest)

        // Attempt to verify format
        const isBcrypt = user.password.startsWith('$2')
        console.log('Is valid bcrypt format?', isBcrypt)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
