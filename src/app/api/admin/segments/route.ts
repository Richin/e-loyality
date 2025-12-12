import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: List all
export async function GET(req: Request) {
    const segments = await prisma.segment.findMany();
    return NextResponse.json(segments);
}

// POST: Create
export async function POST(req: Request) {
    const body = await req.json();
    const { name, criteria } = body;

    await prisma.segment.create({
        data: { name, criteria }
    });

    return NextResponse.json({ message: 'Segment created' });
}
