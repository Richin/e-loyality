import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    try {
        const users = await prisma.user.findMany({
            where: {
                role: 'USER', // Only list regular customers
                OR: [
                    { name: { contains: search } }, // Case insensitive in Postgres, sometimes in MySQL depending on collation
                    { email: { contains: search } }
                ]
            },
            include: {
                memberProfile: {
                    include: { tier: true }
                }
            },
            take: 50, // Limit results
            orderBy: { createdAt: 'desc' }
        });

        const formatted = users.map(u => ({
            id: u.memberProfile?.id, // Use profile ID for CRM routes usually, or User ID. Let's stick to Profile ID for loyalty ops.
            userId: u.id,
            name: u.name || 'Unknown',
            email: u.email,
            points: u.memberProfile?.pointsBalance || 0,
            tier: u.memberProfile?.tier?.name || 'None',
            segment: u.memberProfile?.segment,
            isSuspended: u.isSuspended,
            joinDate: u.memberProfile?.joinDate
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}
