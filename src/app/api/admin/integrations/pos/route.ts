
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role Check
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: { select: { name: true } } }
    });

    const roleName = user?.role?.name || '';
    if (!['ADMIN', 'SUPER ADMIN', 'MANAGER'].includes(roleName)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const terminals = await prisma.posTerminal.findMany({
            orderBy: { lastSyncAt: 'desc' },
            include: { store: { select: { name: true } } }
        });
        return NextResponse.json(terminals);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
