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
        const { rewardId } = body;

        if (!rewardId) {
            return NextResponse.json({ message: 'Reward ID is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { memberProfile: true }
        });

        if (!user || !user.memberProfile) {
            return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
        }

        const reward = await prisma.reward.findUnique({
            where: { id: rewardId }
        });

        if (!reward) {
            return NextResponse.json({ message: 'Reward not found' }, { status: 404 });
        }

        if (user.memberProfile.pointsBalance < reward.pointsCost) {
            return NextResponse.json({ message: 'Insufficient points' }, { status: 400 });
        }

        // Process redemption transactionally
        await prisma.$transaction(async (tx) => {
            // Deduct points
            await tx.memberProfile.update({
                where: { id: user.memberProfile!.id },
                data: {
                    pointsBalance: { decrement: reward.pointsCost }
                }
            });

            // Create redemption record with Voucher Code
            const voucherCode = `V-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 90); // Default 90 days expiry

            await tx.redemption.create({
                data: {
                    memberProfileId: user.memberProfile!.id,
                    rewardId: reward.id,
                    status: 'PENDING', // Pending until used? Or Fulfilled as "Voucher Issued"? Let's say Fulfilled means issued.
                    code: voucherCode,
                    expiresAt: expiryDate
                }
            });

            // Create transaction record
            await tx.loyaltyTransaction.create({
                data: {
                    memberProfileId: user.memberProfile!.id,
                    type: 'REDEEM',
                    points: -reward.pointsCost,
                    description: `Redeemed: ${reward.name}`
                }
            });
        });

        return NextResponse.json({ message: 'Redemption successful' }, { status: 200 });
    } catch (error) {
        console.error('Redemption error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
