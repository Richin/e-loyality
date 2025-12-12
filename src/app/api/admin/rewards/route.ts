import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rewards = await prisma.reward.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json(rewards);
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
            description: body.description,
            pointsCost: parseInt(body.pointsCost),
            category: body.category || 'OTHER',
            type: body.type || 'DIGITAL',
            inventory: body.inventory ? parseInt(body.inventory) : null,
            limitPerUser: body.limitPerUser ? parseInt(body.limitPerUser) : null,
            startDate: body.startDate ? new Date(body.startDate) : null,
            endDate: body.endDate ? new Date(body.endDate) : null,
            autoApprove: body.autoApprove !== false,
            voucherPrefix: body.voucherPrefix || null,
            isActive: body.isActive !== false
        };

        if (body.id) {
            const reward = await prisma.reward.update({ where: { id: body.id }, data });
            return NextResponse.json(reward);
        } else {
            const reward = await prisma.reward.create({ data });
            return NextResponse.json(reward);
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

        await prisma.reward.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
