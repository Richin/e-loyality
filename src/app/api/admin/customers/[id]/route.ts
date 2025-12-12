import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params; // memberProfileId

    try {
        const profile = await prisma.memberProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: { name: true, email: true, role: true, isSuspended: true, createdAt: true }
                },
                tier: true,
                transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
                redemptions: { include: { reward: true }, orderBy: { redeemedAt: 'desc' } }
            }
        });

        if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Fetch Audit Logs for this target
        const auditLogs = await prisma.auditLog.findMany({
            where: { targetId: id },
            include: { admin: { select: { name: true } } }, // Show who did it
            orderBy: { createdAt: 'desc' }
        });

        // Fetch all tiers for dropdown
        const allTiers = await prisma.tier.findMany();

        return NextResponse.json({ profile, auditLogs, allTiers });

    } catch (error: any) {
        console.error('Customer Detail Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch customer details' }, { status: 500 });
    }
}
