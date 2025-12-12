import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { memberProfile: { include: { tier: true } } }
        });

        if (!user || !user.memberProfile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = user.memberProfile;
        const now = new Date();
        const currentTierThreshold = profile.tier?.threshold || 0;

        // Fetch active promotions
        const promotions = await prisma.promotion.findMany({
            where: {
                isActive: true,
                OR: [
                    { startDate: null },
                    { startDate: { lte: now } }
                ],
                AND: [
                    { OR: [{ endDate: null }, { endDate: { gte: now } }] }
                ]
            },
            include: { minTier: true }
        });

        // Filter and Enhance
        const eligiblePromotions = promotions.filter(promo => {
            // Tier Check
            if (promo.minTier) {
                if (currentTierThreshold < promo.minTier.threshold) return false;
            }

            // Birthday Check (if strict type)
            if (promo.type === 'BIRTHDAY') {
                if (!profile.dateOfBirth) return false;
                const dob = new Date(profile.dateOfBirth);
                const isBirthdayMonth = dob.getMonth() === now.getMonth();
                // Simple logic: Valid if birthday month
                return isBirthdayMonth;
            }

            return true;
        });

        return NextResponse.json(eligiblePromotions);

    } catch (error: any) {
        console.error('Promotions error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
