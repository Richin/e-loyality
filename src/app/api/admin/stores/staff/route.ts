import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    try {
        const staff = await prisma.storeStaff.findMany({
            where: { storeId },
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(staff);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get('storeId');
        if (!storeId) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

        const body = await req.json();
        // body: { email: string, role: string }

        const user = await prisma.user.findUnique({ where: { email: body.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const staff = await prisma.storeStaff.create({
            data: {
                storeId,
                userId: user.id,
                role: body.role || 'CASHIER'
            },
            include: { user: { select: { name: true, email: true } } }
        });

        return NextResponse.json(staff);
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'User is already staff here' }, { status: 409 });
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.storeStaff.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
