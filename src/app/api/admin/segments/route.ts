import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const segments = await prisma.segment.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { campaigns: true } } }
        });

        // For each segment, calculate member count dynamically
        // In a real app, this might be cached or stored.
        const segmentsWithCount = await Promise.all(segments.map(async (seg) => {
            const count = await calculateSegmentSize(seg.criteria);
            return { ...seg, memberCount: count };
        }));

        return NextResponse.json(segmentsWithCount);
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
        const { name, criteria } = body; // criteria is JSON string

        if (!name || !criteria) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const segment = await prisma.segment.create({
            data: { name, criteria }
        });

        return NextResponse.json(segment);
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
        await prisma.segment.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


// --- HELPER: Segment Evaluation Logic ---
// Matches users based on JSON criteria
async function calculateSegmentSize(criteriaJson: string): Promise<number> {
    try {
        const criteria = JSON.parse(criteriaJson);
        const where: any = {};

        // 1. Min Points Balance
        if (criteria.minPoints) {
            where.pointsBalance = { gte: parseInt(criteria.minPoints) };
        }

        // 2. Specific Tier
        if (criteria.tierId) {
            where.currentTierId = criteria.tierId;
        }

        // 3. Last Visit (Inactive Days)
        if (criteria.inactiveDays) {
            const date = new Date();
            date.setDate(date.getDate() - parseInt(criteria.inactiveDays));
            where.lastVisitDate = { lt: date };
        }

        // 4. Joined After
        if (criteria.joinedAfter) {
            where.joinDate = { gte: new Date(criteria.joinedAfter) };
        }

        // 5. Churn Segment
        if (criteria.segment) {
            where.segment = criteria.segment; // VIP, CHURNED etc.
        }

        const count = await prisma.memberProfile.count({ where });
        return count;
    } catch (e) {
        console.error("Error parsing criteria", e);
        return 0;
    }
}
