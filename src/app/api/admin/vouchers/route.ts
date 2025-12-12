import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: List all vouchers
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (code) {
        // Validate specific code
        const redemption = await prisma.redemption.findUnique({
            where: { code },
            include: { reward: true, memberProfile: { include: { user: true } } }
        });

        if (!redemption) return NextResponse.json({ message: 'Invalid Code' }, { status: 404 });
        return NextResponse.json(redemption);
    }

    // List recent
    const vouchers = await prisma.redemption.findMany({
        orderBy: { redeemedAt: 'desc' },
        take: 50,
        include: { reward: true, memberProfile: { include: { user: true } } }
    });
    return NextResponse.json(vouchers);
}

// POST: Redeem/Burn a voucher
export async function POST(req: Request) {
    const { code } = await req.json();

    const redemption = await prisma.redemption.findUnique({ where: { code } });
    if (!redemption) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    if (redemption.usedAt) return NextResponse.json({ message: 'Already used' }, { status: 400 });
    if (redemption.expiresAt && new Date() > redemption.expiresAt) return NextResponse.json({ message: 'Expired' }, { status: 400 });

    await prisma.redemption.update({
        where: { id: redemption.id },
        data: { usedAt: new Date(), status: 'REDEEMED' }
    });

    return NextResponse.json({ message: 'Voucher successfully redeemed' });
}
