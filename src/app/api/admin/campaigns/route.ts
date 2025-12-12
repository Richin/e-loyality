import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: { segment: true } // Include segment name
        });
        return NextResponse.json(campaigns);
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
        const { name, subject, content, type, segmentId, scheduledAt, triggerEvent } = body;

        const campaign = await prisma.campaign.create({
            data: {
                name,
                subject,
                content,
                type, // EMAIL, SMS
                status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
                segmentId,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                triggerEvent
            }
        });

        return NextResponse.json(campaign);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await req.json();
        const { id, action } = body; // action: SEND_NOW, CANCEL

        const campaign = await prisma.campaign.findUnique({ where: { id }, include: { segment: true } });
        if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

        if (action === 'SEND_NOW') {
            if (campaign.status === 'SENT') return NextResponse.json({ error: 'Already sent' }, { status: 400 });

            // 1. Fetch Recipients
            let recipients: any[] = [];
            if (campaign.segment) {
                recipients = await getSegmentMembers(campaign.segment.criteria);
            } else {
                // All Active Users if no segment? Or error? Let's say All Active for now or error.
                // For safety, require segment for now.
                return NextResponse.json({ error: 'Segment required for manual send' }, { status: 400 });
            }

            // 2. "Send" Messages (Simulate)
            const logsData = recipients.map(p => ({
                campaignId: campaign.id,
                userId: p.userId,
                recipient: p.user.email || p.phone || 'Unknown',
                channel: campaign.type,
                status: 'SENT' // Simulated success
            }));

            if (logsData.length > 0) {
                await prisma.communicationLog.createMany({ data: logsData });
            }

            // 3. Update Campaign Status
            const updated = await prisma.campaign.update({
                where: { id },
                data: { status: 'SENT', sentAt: new Date() }
            });

            return NextResponse.json({ success: true, count: recipients.length, campaign: updated });
        }

        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

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
        await prisma.campaign.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- HELPER: Re-use logic from Segments API (Duplicate for simplicity in this context, or export utility) ---
async function getSegmentMembers(criteriaJson: string) {
    try {
        const criteria = JSON.parse(criteriaJson);
        const where: any = {};

        if (criteria.minPoints) where.pointsBalance = { gte: parseInt(criteria.minPoints) };
        if (criteria.tierId) where.currentTierId = criteria.tierId;
        if (criteria.joinedAfter) where.joinDate = { gte: new Date(criteria.joinedAfter) };
        if (criteria.segment) where.segment = criteria.segment;

        // Always include User for email
        return await prisma.memberProfile.findMany({
            where,
            include: { user: { select: { email: true, name: true } } }
        });
    } catch (e) {
        return [];
    }
}
