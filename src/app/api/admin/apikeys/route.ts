import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { nanoid } from 'nanoid';

// GET: List keys
export async function GET(req: Request) {
    // Add Admin check here
    const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(keys);
}

// POST: Create key
export async function POST(req: Request) {
    const { name } = await req.json();
    const key = `sk_live_${nanoid(24)}`; // Generate secure-looking key

    await prisma.apiKey.create({
        data: { name, key }
    });

    return NextResponse.json({ message: 'Key created' });
}

// PUT: Toggle status
export async function PUT(req: Request) {
    const { id, isActive } = await req.json();
    await prisma.apiKey.update({
        where: { id },
        data: { isActive }
    });
    return NextResponse.json({ message: 'Key updated' });
}
