import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to send message (mock)
async function sendMockMessage(userId: string, subject: string, content: string) {
    // In real app, create a simplified "Notification" or "Campaign" record
    // For now, we'll just log or maybe create a "System Message" campaign
    console.log(`Sending to ${userId}: ${subject}`);
}

export async function POST(req: Request) {
    let logs = [];

    try {
        // 1. Check Birthday Automations
        const today = new Date();
        const month = today.getMonth() + 1; // JS months are 0-indexed
        const day = today.getDate();

        // Prisma doesn't strictly support Date functions in `where` easily across all DBs without raw query
        // We'll fetch all profiles with birthdays and filter in memory for this MVP (not performant for millions, ok for thousands)
        const allProfiles = await prisma.memberProfile.findMany({ select: { id: true, userId: true, dateOfBirth: true } });

        const birthdayProfiles = allProfiles.filter(p => {
            if (!p.dateOfBirth) return false;
            const dob = new Date(p.dateOfBirth);
            return dob.getMonth() + 1 === month && dob.getDate() === day;
        });

        logs.push(`Found ${birthdayProfiles.length} birthdays.`);

        // Create Birthday Campaign if it doesn't exist for today (Mock logic)
        for (const p of birthdayProfiles) {
            // Mock sending "Happy Birthday" details
            // In real system: check if they already received it this year
        }


        // 2. Check Inactivity (e.g. > 30 Days)
        // We need a `lastLogin` field on User, but we don't have it tracked strictly yet.
        // We can use `updatedAt` on MemberProfile as a proxy for "last activity" if we ensure it updates on login
        // For now, let's use `updatedAt` < 30 days ago
        const inactiveDate = new Date();
        inactiveDate.setDate(inactiveDate.getDate() - 30);

        const inactiveProfiles = await prisma.memberProfile.findMany({
            where: { updatedAt: { lt: inactiveDate } },
            select: { id: true }
        });
        logs.push(`Found ${inactiveProfiles.length} inactive users.`);


        // 3. Process Scheduled Campaigns
        // Find campaigns with status 'SCHEDULED' and scheduledAt <= Now
        const scheduledCampaigns = await prisma.campaign.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { lte: new Date() }
            }
        });
        logs.push(`Found ${scheduledCampaigns.length} scheduled campaigns ready to send.`);

        for (const campaign of scheduledCampaigns) {
            // "Send" the campaign
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: 'SENT', sentAt: new Date() }
            });
            // Real logic: trigger the send email job
        }

        return NextResponse.json({
            message: 'Automations ran successfully',
            logs
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error running automations' }, { status: 500 });
    }
}
