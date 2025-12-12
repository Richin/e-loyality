import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    try {
        const where: any = {};
        if (status) where.status = status;

        const redemptions = await prisma.redemption.findMany({
            where,
            include: {
                memberProfile: { include: { user: { select: { name: true, email: true } } } },
                reward: { select: { name: true, pointsCost: true, voucherPrefix: true } }
            },
            orderBy: { redeemedAt: 'desc' },
            take: 50
        });
        return NextResponse.json(redemptions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await req.json();
        const { id, action } = body; // action: APPROVE, REJECT

        // Role Check
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: { select: { name: true } } }
        });

        const roleName = user?.role?.name || '';
        if (!['ADMIN', 'SUPER ADMIN', 'MANAGER'].includes(roleName)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const redemption = await prisma.redemption.findUnique({
            where: { id },
            include: { reward: true, memberProfile: true }
        });

        if (!redemption) return NextResponse.json({ error: 'Redemption not found' }, { status: 404 });
        if (redemption.status !== 'PENDING') return NextResponse.json({ error: 'Can only process PENDING requests' }, { status: 400 });

        if (action === 'APPROVE') {
            const prefix = redemption.reward.voucherPrefix || 'V-';
            const code = prefix + randomBytes(4).toString('hex').toUpperCase();

            await prisma.redemption.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    code,
                    approvedBy: session.user.email,
                    approvedAt: new Date()
                }
            });
            // TODO: Trigger Email Notification
            return NextResponse.json({ success: true, status: 'APPROVED', code });
        }
        else if (action === 'REJECT') {
            // Refund Points
            await prisma.$transaction([
                prisma.memberProfile.update({
                    where: { id: redemption.memberProfileId },
                    data: { pointsBalance: { increment: redemption.reward.pointsCost } }
                }),
                prisma.loyaltyTransaction.create({
                    data: {
                        memberProfileId: redemption.memberProfileId,
                        type: 'REFUND',
                        points: redemption.reward.pointsCost,
                        description: `Refund for rejected redemption: ${redemption.reward.name}`
                    }
                }),
                prisma.redemption.update({
                    where: { id },
                    data: {
                        status: 'REJECTED',
                        approvedBy: session.user.email,
                        approvedAt: new Date()
                    }
                })
            ]);
            return NextResponse.json({ success: true, status: 'REJECTED' });
        }

        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
