import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // In production, check for a CRON_SECRET header
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    try {
        const now = new Date();

        // 1. Find due campaigns
        const campaigns = await prisma.campaign.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { lte: now }
            },
            include: { segment: true }
        });

        if (campaigns.length === 0) {
            return NextResponse.json({ message: 'No scheduled campaigns due', count: 0 });
        }

        let processedCount = 0;

        // 2. Process each
        for (const campaign of campaigns) {
            let recipients: any[] = [];

            // Reuse segment logic (simplified)
            if (campaign.segment) {
                recipients = await getSegmentMembers(campaign.segment.criteria);
            }

            // Batch insert logs
            const logsData = recipients.map(p => ({
                campaignId: campaign.id,
                userId: p.userId,
                recipient: p.user.email || p.phone || 'Unknown', // Fallback
                channel: campaign.type,
                status: 'SENT'
            }));

            if (logsData.length > 0) {
                await prisma.communicationLog.createMany({ data: logsData });
            }

            // Update Status
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: 'SENT', sentAt: now }
            });

            processedCount++;
            console.log(`[Cron] Sent Campaign: ${campaign.name} to ${logsData.length} recipients`);
        }

        return NextResponse.json({ success: true, processed: processedCount });

    } catch (error: any) {
        console.error('[Cron] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Reuse logic from API/Service (Should be refactored into a shared lib in real app)
async function getSegmentMembers(criteriaJson: string) {
    try {
        const criteria = JSON.parse(criteriaJson);
        const where: any = {};

        if (criteria.minPoints) where.pointsBalance = { gte: parseInt(criteria.minPoints) };
        if (criteria.tierId) where.currentTierId = criteria.tierId;
        if (criteria.joinedAfter) where.joinDate = { gte: new Date(criteria.joinedAfter) };
        if (criteria.segment) where.segment = criteria.segment;

        return await prisma.memberProfile.findMany({
            where,
            include: { user: { select: { email: true, name: true } } }
        });
    } catch (e) {
        return [];
    }
}
