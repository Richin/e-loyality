import prisma from '@/lib/prisma';

export async function triggerEvent(eventName: string, userId: string) {
    console.log(`[Marketing] Trigger Event: ${eventName} for User: ${userId}`);

    try {
        // 1. Find Active Campaigns with this Trigger
        const campaigns = await prisma.campaign.findMany({
            where: {
                triggerEvent: eventName,
                status: 'ACTIVE'
            },
            include: { segment: true }
        });

        if (campaigns.length === 0) return;

        // 2. Fetch User Details
        const member = await prisma.memberProfile.findUnique({
            where: { userId },
            include: { user: true }
        });

        if (!member) return;

        // 3. Process each campaign
        for (const campaign of campaigns) {
            // Check Segment Match
            let isMatch = true;
            if (campaign.segment) {
                isMatch = await evaluateSegment(campaign.segment.criteria, member);
            }

            if (isMatch) {
                // Simulate Sending
                await prisma.communicationLog.create({
                    data: {
                        campaignId: campaign.id,
                        userId: member.userId,
                        recipient: member.user.email || 'Unknown',
                        channel: campaign.type, // EMAIL or SMS
                        status: 'SENT'
                    }
                });
                console.log(`[Marketing] Sent Campaign "${campaign.name}" to ${member.user.email}`);
            }
        }

    } catch (e) {
        console.error('[Marketing] Error processing trigger:', e);
    }
}

// Reuse logic (simplified version of what's in admin API)
async function evaluateSegment(criteriaJson: string, member: any): Promise<boolean> {
    try {
        const criteria = JSON.parse(criteriaJson);

        if (criteria.minPoints && member.pointsBalance < parseInt(criteria.minPoints)) return false;
        if (criteria.tierId && member.currentTierId !== criteria.tierId) return false;
        // Add more checks as needed

        return true;
    } catch (e) {
        return false;
    }
}
