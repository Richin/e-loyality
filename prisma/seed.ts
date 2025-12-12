
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@example.com'
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Test User',
      password: hashedPassword,
      role: 'USER',
      memberProfile: {
        create: {
          currentTier: 'BRONZE',
          pointsBalance: 100,
          phone: '1234567890',
        },
      },
    },
  })

  const rewards = [
    { name: '$5 Gift Card', description: 'Redeem for a $5 store credit', pointsCost: 50 },
    { name: 'T-Shirt', description: 'Limited edition loyalty member t-shirt', pointsCost: 100 },
    { name: 'Premium Subscription', description: '1 month of premium benefits', pointsCost: 200 },
  ]

  for (const reward of rewards) {
    await prisma.reward.create({
      data: reward,
    })
  }

  console.log({ user, rewardsCount: rewards.length })
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
