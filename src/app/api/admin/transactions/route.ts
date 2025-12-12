import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const type = searchParams.get('type'); // EARN, REDEEM
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const where: any = {};
        if (storeId) where.storeId = storeId;
        if (type) where.type = type;

        const transactions = await prisma.loyaltyTransaction.findMany({
            where,
            include: {
                memberProfile: { include: { user: { select: { name: true, email: true } } } },
                store: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return NextResponse.json(transactions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
