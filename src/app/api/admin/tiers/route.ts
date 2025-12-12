import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: List all tiers
export async function GET(req: Request) {
    const tiers = await prisma.tier.findMany({ orderBy: { threshold: 'asc' } });
    return NextResponse.json(tiers);
}

// POST: Create/Update tier
export async function POST(req: Request) {
    const { name, threshold, benefits } = await req.json();

    // Simple upsert logic or create
    // For now, let's just create new ones or update if ID exists (omitted for brevity, handling create only for MVP)
    const tier = await prisma.tier.upsert({
        where: { name }, // Name unique
        update: { threshold: Number(threshold), benefits },
        create: { name, threshold: Number(threshold), benefits }
    });

    return NextResponse.json({ message: 'Tier saved', tier });
}
