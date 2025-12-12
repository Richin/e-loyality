import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// internal function to check and award badges
export async function checkBadges(memberProfileId: string) {
    const profile = await prisma.memberProfile.findUnique({
        where: { id: memberProfileId },
        include: { userBadges: true }
    });

    if (!profile) return;

    const badgesToAward = [];

    // 1. "Newbie" - Joined
    badgesToAward.push({ name: 'Newbie', icon: '👋', description: 'Joined the loyalty program' });

    // 2. "Big Spender" - > 1000 points
    if (profile.pointsBalance >= 1000) {
        badgesToAward.push({ name: 'Big Spender', icon: '💎', description: 'Earned 1000+ points' });
    }

    // 3. "Gold Member" - Tier is Gold
    if (profile.currentTier === 'GOLD') {
        badgesToAward.push({ name: 'Gold Club', icon: '🏆', description: 'Reached Gold Tier' });
    }

    for (const badgeData of badgesToAward) {
        // Find or create the badge definition
        const badge = await prisma.badge.upsert({
            where: { name: badgeData.name },
            update: {},
            create: badgeData
        });

        // Check if user already has it
        const hasBadge = profile.userBadges.some(ub => ub.badgeId === badge.id);

        if (!hasBadge) {
            await prisma.userBadge.create({
                data: {
                    memberProfileId: profile.id,
                    badgeId: badge.id
                }
            });
        }
    }
}

// POST: Trigger badge check manually (useful for testing)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { memberProfile: true }
    });

    if (!user?.memberProfile) return NextResponse.json({ message: 'No profile' }, { status: 404 });

    await checkBadges(user.memberProfile.id);

    return NextResponse.json({ message: 'Badges synced' });
}
