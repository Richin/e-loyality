import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { nanoid } from 'nanoid';

// GET: Generate/Get Referral Code for current user
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { memberProfile: true }
        });

        if (!user || !user.memberProfile) return NextResponse.json({ message: 'Profile not found' }, { status: 404 });

        let code = user.memberProfile.referralCode;

        if (!code) {
            // Generate a new simple code (e.g., NAME-1234)
            const prefix = (user.name || 'USER').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
            code = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

            // Ensure uniqueness (simple retry)
            let isUnique = false;
            while (!isUnique) {
                const existing = await prisma.memberProfile.findUnique({ where: { referralCode: code } });
                if (!existing) isUnique = true;
                else code = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
            }

            await prisma.memberProfile.update({
                where: { id: user.memberProfile.id },
                data: { referralCode: code }
            });
        }

        return NextResponse.json({ code });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}

// POST: Redeem a referral code
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { code } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { memberProfile: true }
        });

        if (!user?.memberProfile) return NextResponse.json({ message: 'Error' }, { status: 400 });

        if (user.memberProfile.referredBy) {
            return NextResponse.json({ message: 'You have already been referred.' }, { status: 400 });
        }

        if (user.memberProfile.referralCode === code) {
            return NextResponse.json({ message: 'You cannot refer yourself.' }, { status: 400 });
        }

        const referrer = await prisma.memberProfile.findUnique({
            where: { referralCode: code }
        });

        if (!referrer) {
            return NextResponse.json({ message: 'Invalid referral code.' }, { status: 404 });
        }

        // Award points transaction
        await prisma.$transaction([
            // Update User: Set referredBy
            prisma.memberProfile.update({
                where: { id: user.memberProfile.id },
                data: {
                    referredBy: code,
                    pointsBalance: { increment: 50 } // Bonus for new user
                }
            }),
            // Record Transaction for User
            prisma.loyaltyTransaction.create({
                data: {
                    memberProfileId: user.memberProfile.id,
                    type: 'EARN',
                    points: 50,
                    description: `Referral Bonus (Code: ${code})`
                }
            }),
            // Update Referrer: Award points
            prisma.memberProfile.update({
                where: { id: referrer.id },
                data: { pointsBalance: { increment: 100 } }
            }),
            // Record Transaction for Referrer
            prisma.loyaltyTransaction.create({
                data: {
                    memberProfileId: referrer.id,
                    type: 'EARN',
                    points: 100,
                    description: `Referral Reward (Ref: ${user.name})`
                }
            }),
        ]);

        return NextResponse.json({ message: 'Referral code redeemed! You got 50 points.' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
