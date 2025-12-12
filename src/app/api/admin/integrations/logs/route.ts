
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
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
        const logs = await prisma.integrationLog.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            include: { apiKey: { select: { name: true } } }
        });
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
