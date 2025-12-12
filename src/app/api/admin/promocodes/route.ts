import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    // Role Check
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: { select: { name: true } } }
    });

    const roleName = user?.role?.name || '';
    if (!['ADMIN', 'SUPER ADMIN', 'MANAGER'].includes(roleName)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const codes = await prisma.promoCode.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(codes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await req.json();
        const { code, type, value, usageLimit, expiresAt, description } = body;

        if (!code || !type || !value) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const existing = await prisma.promoCode.findUnique({ where: { code } });
        if (existing) return NextResponse.json({ error: 'Code already exists' }, { status: 400 });

        const newCode = await prisma.promoCode.create({
            data: {
                code: code.toUpperCase(),
                type, // FLAT, PERCENTAGE, BONUS_POINTS
                value: parseFloat(value),
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                description
            }
        });

        return NextResponse.json(newCode);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    try {
        await prisma.promoCode.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
