import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const stores = await prisma.store.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { transactions: true } } }
        });
        return NextResponse.json(stores);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const store = await prisma.store.create({
            data: {
                name: body.name,
                address: body.address,
                city: body.city,
                postalCode: body.postalCode,
                latitude: 0, // Mock lat/long for now
                longitude: 0,
                posStatus: 'ONLINE' // Default
            }
        });
        return NextResponse.json(store);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.store.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
