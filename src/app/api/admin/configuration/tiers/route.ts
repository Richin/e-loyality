import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: List all tiers
export async function GET() {
    try {
        const tiers = await prisma.tier.findMany({ orderBy: { threshold: 'asc' } });
        return NextResponse.json(tiers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create or Update Tier
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await req.json();
        // If ID present, update; else create
        if (body.id) {
            const tier = await prisma.tier.update({
                where: { id: body.id },
                data: {
                    name: body.name,
                    threshold: parseInt(body.threshold),
                    benefits: body.benefits
                }
            });
            return NextResponse.json(tier);
        } else {
            const tier = await prisma.tier.create({
                data: {
                    name: body.name,
                    threshold: parseInt(body.threshold),
                    benefits: body.benefits
                }
            });
            return NextResponse.json(tier);
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove Tier
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.tier.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
