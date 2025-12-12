import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rules = await prisma.loyaltyRule.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json(rules);
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

        const data = {
            name: body.name,
            type: body.type,
            multiplier: body.multiplier ? parseFloat(body.multiplier) : 1.0,
            bonusPoints: body.bonusPoints ? parseInt(body.bonusPoints) : 0,
            minSpend: body.minSpend ? parseFloat(body.minSpend) : null,
            productId: body.productId || null,
            startDate: body.startDate ? new Date(body.startDate) : null,
            endDate: body.endDate ? new Date(body.endDate) : null,
            isActive: body.isActive !== false
        };

        if (body.id) {
            // Role Check for update
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { role: { select: { name: true } } }
            });

            const roleName = user?.role?.name || '';
            if (!['ADMIN', 'SUPER ADMIN', 'MANAGER'].includes(roleName)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const rule = await prisma.loyaltyRule.update({ where: { id: body.id }, data });
            return NextResponse.json(rule);
        } else {
            // Role Check for create
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { role: { select: { name: true } } }
            });

            const roleName = user?.role?.name || '';
            if (!['ADMIN', 'SUPER ADMIN', 'MANAGER'].includes(roleName)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const rule = await prisma.loyaltyRule.create({ data });
            return NextResponse.json(rule);
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.loyaltyRule.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
