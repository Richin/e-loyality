
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@example.com'
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create Tiers
  const tiers = [
    { name: 'Bronze', threshold: 0, benefits: 'Basic benefits' },
    { name: 'Silver', threshold: 1000, benefits: 'Silver benefits' },
    { name: 'Gold', threshold: 5000, benefits: 'Gold benefits' },
  ]

  for (const tier of tiers) {
    await prisma.tier.upsert({
      where: { name: tier.name },
      update: {},
      create: tier,
    })
  }

  const bronzeTier = await prisma.tier.findUnique({ where: { name: 'Bronze' } })

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
          pointsBalance: 100,
          phone: '1234567890',
          currentTierId: bronzeTier?.id,
          transactions: {
            create: [
              {
                type: 'EARN',
                points: 50,
                description: 'Purchase at Downtown Store',
                amount: 49.99,
                source: 'POS',
                orderId: 'POS-1001'
              },
              {
                type: 'EARN',
                points: 120,
                description: 'Online Order #ON-8821',
                amount: 120.50,
                source: 'ONLINE',
                orderId: 'ON-8821'
              },
              {
                type: 'REDEEM',
                points: -500,
                amount: 0,
                cashbackUsed: 5.00,
                description: 'Redeemed Cashback on Order #ON-9002',
                source: 'ONLINE',
                orderId: 'ON-9002'
              }
            ]
          }
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

  // Create Badges
  const badges = [
    { name: 'Early Adopter', description: 'Joined during the beta phase', icon: '🚀' },
    { name: 'Big Spender', description: 'Spent over $500', icon: '💸' },
    { name: 'Loyal Regular', description: 'Visited 10 days in a row', icon: '🔥' }
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge
    })
  }

  // Create Challenges
  const challenges = [
    { title: 'Monthly Spender', description: 'Spend $200 this month', goal: 200, type: 'SPEND', pointsReward: 500 },
    { title: 'Visit Streak', description: 'Visit 5 days in a row', goal: 5, type: 'VISIT', pointsReward: 100 }
  ]

  for (const chal of challenges) {
    // Challenge has no unique field besides ID, so we just create if not exists or basic check (omitted for speed)
    // For seeding, let's just create them. In real app, avoid dups.
    // Simple check:
    const exists = await prisma.challenge.findFirst({ where: { title: chal.title } })
    if (!exists) {
      await prisma.challenge.create({ data: chal })
    }
  }

  // Create FAQs
  const faqs = [
    { question: 'How do I earn points?', answer: 'You earn points for every purchase at our store or online. $1 spend = 1 point.', category: 'Rewards', order: 1 },
    { question: 'When do my points expire?', answer: 'Points expire 12 months after they are earned if there is no account activity.', category: 'Account', order: 2 },
    { question: 'How can I redeem rewards?', answer: 'Go to the Rewards page, browse the catalog, and click Redeem on your desired item.', category: 'Rewards', order: 3 }
  ]

  for (const faq of faqs) {
    const exists = await prisma.fAQ.findFirst({ where: { question: faq.question } })
    if (!exists) {
      await prisma.fAQ.create({ data: faq })
    }
  }

  console.log({ user, rewardsCount: rewards.length, badgesCount: badges.length, faqsCount: faqs.length })
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
