import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notifyRewardRedeemed } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { rewardId, isGift, recipientEmail } = await req.json();

        if (!rewardId) {
            return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 });
        }

        // Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch User and Profile
            const user = await tx.user.findUnique({
                where: { email: session.user.email! },
                include: { memberProfile: true }
            });

            if (!user || !user.memberProfile) {
                throw new Error('User profile not found');
            }

            const profile = user.memberProfile;

            // 2. Fetch Reward
            const reward = await tx.reward.findUnique({
                where: { id: rewardId }
            });

            if (!reward || !reward.isActive) {
                throw new Error('Reward not found or inactive');
            }

            // 3. Check Points
            if (profile.pointsBalance < reward.pointsCost) {
                throw new Error('Insufficient points');
            }

            // 4. Deduct Points
            await tx.memberProfile.update({
                where: { id: profile.id },
                data: {
                    pointsBalance: { decrement: reward.pointsCost }
                }
            });

            // 5. Create Transaction Record
            await tx.loyaltyTransaction.create({
                data: {
                    memberProfileId: profile.id,
                    type: 'REDEEM',
                    points: -reward.pointsCost,
                    description: `Redeemed: ${reward.name}`
                }
            });

            // 6. Generate Voucher Code
            const code = reward.type === 'DIGITAL'
                ? `V-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().substring(9)}`
                : null; // No code for physical items initially, or handle differently

            // 7. Create Redemption Record
            const redemption = await tx.redemption.create({
                data: {
                    memberProfileId: profile.id,
                    rewardId: reward.id,
                    status: 'PENDING', // Could be FULFILLED immediately for digital
                    code: code,
                    isGift: isGift || false,
                    giftRecipientEmail: isGift ? recipientEmail : null,
                }
            });

            return { redemption, reward };
        });

        // Send Notification
        await notifyRewardRedeemed(result.redemption.memberProfileId, result.reward.name);

        return NextResponse.json(result.redemption);

    } catch (error: any) {
        console.error('Redemption error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
