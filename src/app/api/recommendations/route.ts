import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { calculateRFM } from '@/lib/rfm';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { memberProfile: true }
    });

    if (!user || !user.memberProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    // 1. Calculate/Update Segment
    const { segment } = await calculateRFM(user.memberProfile.id);

    // 2. Mock AI Recommendations based on Segment
    let recommendations = [];

    switch (segment) {
        case 'VIP':
            recommendations = [
                { id: 'r1', title: 'Exclusive: Private Concierge', type: 'Experience', image: 'https://images.unsplash.com/photo-1565516723233-31665a39cb68?auto=format&fit=crop&q=80&w=300' },
                { id: 'r2', title: 'Double Points Weekend', type: 'Promotion', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=300' }
            ];
            break;
        case 'AT_RISK':
            recommendations = [
                { id: 'r3', title: 'We miss you! 500 Bonus Points', type: 'Bonus', image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=300' },
                { id: 'r4', title: '15% Off Your Next Order', type: 'Discount', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=300' }
            ];
            break;
        case 'NEW':
        case 'NEW_POTENTIAL':
            recommendations = [
                { id: 'r5', title: 'Welcome Gift: Free Coffee', type: 'Reward', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=300' },
                { id: 'r6', title: 'Complete Your Profile (+50 pts)', type: 'Task', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=300' }
            ];
            break;
        default:
            recommendations = [
                { id: 'r7', title: 'Trending: Wireless Headphones', type: 'Product', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300' }
            ];
    }

    return NextResponse.json({ segment, recommendations });
}
