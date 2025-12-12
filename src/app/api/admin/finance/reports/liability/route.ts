import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        // Fetch Top Point Holders
        const users = await prisma.memberProfile.findMany({
            orderBy: { pointsBalance: 'desc' },
            take: limit,
            include: {
                user: { select: { name: true, email: true } },
                tier: { select: { name: true } }
            }
        });

        // Determine Point Value
        const pointValueSetting = await prisma.programSetting.findUnique({
            where: { settingKey: 'point_value' }
        });
        const pointValue = pointValueSetting ? parseFloat(pointValueSetting.value) : 0.01;

        const report = users.map(u => ({
            id: u.id,
            name: u.user.name || 'Unknown',
            email: u.user.email,
            tier: u.tier?.name || 'None',
            points: u.pointsBalance,
            cashback: u.cashbackBalance,
            prepaid: u.prepaidBalance,
            liabilityValue: (u.pointsBalance * pointValue) + u.cashbackBalance + u.prepaidBalance
        }));

        return NextResponse.json(report);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
