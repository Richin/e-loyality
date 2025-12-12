import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        // Fetch all SENT campaigns as "notifications"
        const campaigns = await prisma.campaign.findMany({
            where: { status: 'SENT' },
            orderBy: { sentAt: 'desc' },
            take: 20
        });

        const notifications = campaigns.map(c => ({
            id: c.id,
            title: c.subject || c.name,
            message: c.content,
            date: c.sentAt,
            type: c.type
        }));

        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
