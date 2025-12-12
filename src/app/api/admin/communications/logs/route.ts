import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const logs = await prisma.communicationLog.findMany({
            take: limit,
            orderBy: { sentAt: 'desc' },
            include: {
                campaign: { select: { name: true } }
            }
        });
        return NextResponse.json(logs);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
