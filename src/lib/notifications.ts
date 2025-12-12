import prisma from '@/lib/prisma';

type NotificationType = 'EARN' | 'REDEEM' | 'SYSTEM' | 'PROMOTION';

/**
 * Creates an in-app notification and logs mock Email/SMS alerts.
 * @param memberProfileId The ID of the MemberProfile to notify
 * @param type The type of notification
 * @param title Title for the notification
 * @param message Body message
 */
export async function createNotification(
    memberProfileId: string,
    type: NotificationType,
    title: string,
    message: string
) {
    try {
        // 1. Create In-App Notification
        const notification = await prisma.notification.create({
            data: {
                memberProfileId,
                type,
                title,
                message,
                isRead: false
            }
        });

        // 2. Mock Email Sending
        // In a real app, this would use a provider like Resend, SendGrid, or AWS SES
        console.log(`\n--- [MOCK EMAIL SENT] ---`);
        console.log(`To: Member ${memberProfileId}`);
        console.log(`Subject: ${title}`);
        console.log(`Body: ${message}`);
        console.log(`-------------------------\n`);

        // 3. Mock SMS Sending
        // In a real app, this would use Twilio or similar
        console.log(`\n--- [MOCK SMS SENT] ---`);
        console.log(`To: Member ${memberProfileId}`);
        console.log(`Message: ${message}`);
        console.log(`-----------------------\n`);

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return null; // Don't crash the flow if notification fails
    }
}

/**
 * Trigger for when points are earned
 */
export async function notifyPointsEarned(memberProfileId: string, points: number, reason: string) {
    return createNotification(
        memberProfileId,
        'EARN',
        'Points Earned!',
        `You've earned ${points} points for ${reason}. Keep it up!`
    );
}

/**
 * Trigger for when rewards are redeemed
 */
export async function notifyRewardRedeemed(memberProfileId: string, rewardName: string) {
    return createNotification(
        memberProfileId,
        'REDEEM',
        'Reward Redeemed',
        `You successfully redeemed: ${rewardName}. Enjoy your reward!`
    );
}

/**
 * Trigger for tier upgrade
 */
export async function notifyTierUpgrade(memberProfileId: string, newTierName: string) {
    return createNotification(
        memberProfileId,
        'SYSTEM',
        'Tier Upgraded!',
        `Congratulations! You've reached the ${newTierName} tier. Enjoy your new benefits!`
    );
}
