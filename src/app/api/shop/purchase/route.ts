import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { productId, productName, amount } = body;

        if (!amount || !productId) {
            return NextResponse.json({ message: 'Invalid product data' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { memberProfile: true }
        });

        if (!user || !user.memberProfile) {
            return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
        }

        // 1. Fetch Program Settings for Earn Rate
        const earnRateSetting = await prisma.programSetting.findUnique({ where: { settingKey: 'earn_rate' } });
        const earnRate = parseFloat(earnRateSetting?.value || '1');

        const pointsEarned = Math.floor(amount * earnRate);

        // Process purchase and points earning transactionally
        await prisma.$transaction(async (tx) => {
            // Update points
            const currentProfile = await tx.memberProfile.findUniqueOrThrow({ where: { id: user.memberProfile!.id } });
            const newBalance = currentProfile.pointsBalance + pointsEarned;

            // 2. Dynamic Tier Check
            const allTiers = await tx.tier.findMany({ orderBy: { threshold: 'desc' } }); // Highest first
            let newTier = currentProfile.currentTier;

            // Find the highest tier they qualify for based on TOTAL points (assuming logic is based on current balance)
            const eligibleTier = allTiers.find(t => newBalance >= t.threshold);
            if (eligibleTier) {
                newTier = eligibleTier.name;
            }

            await tx.memberProfile.update({
                where: { id: user.memberProfile!.id },
                data: {
                    pointsBalance: { increment: pointsEarned },
                    currentTier: newTier
                }
            });

            // Create earn transaction record
            await tx.loyaltyTransaction.create({
                data: {
                    memberProfileId: user.memberProfile!.id,
                    type: 'EARN',
                    points: pointsEarned,
                    amount: amount,
                    description: `Purchased: ${productName}`
                }
            });

            // Note: In a real app, we would also create an Order record here
        });

        return NextResponse.json({
            message: 'Purchase successful',
            pointsEarned
        }, { status: 200 });
    } catch (error) {
        console.error('Purchase error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
