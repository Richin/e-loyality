
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// GET LIST
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role Check
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: { select: { name: true } } }
    });

    const roleName = user?.role?.name || '';
    if (!['ADMIN', 'SUPER ADMIN', 'MANAGER'].includes(roleName)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const keys = await prisma.apiKey.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                key: true, // In real app, maybe mask this
                isActive: true,
                createdAt: true,
                lastUsedAt: true,
                rateLimitWaiver: true,
                permissions: true,
                lastIp: true
            }
        });
        return NextResponse.json(keys);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// CREATE KEY
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role Check
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: { select: { name: true } } }
    });

    const roleName = user?.role?.name || '';
    if (!['ADMIN', 'SUPER ADMIN', 'MANAGER'].includes(roleName)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        // Generate a random key
        const key = 'sk_' + crypto.randomBytes(24).toString('hex');

        const newKey = await prisma.apiKey.create({
            data: {
                name: body.name,
                permissions: body.permissions, // e.g. "READ_ONLY,POS_SYNC"
                rateLimitWaiver: body.rateLimitWaiver || false,
                key: key
            }
        });

        return NextResponse.json(newKey);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE KEY (via DELETE method on list? No, probably should have a per-id route, but for simplicity managing here if possible or I should make a [id] route.
// Let's Stick to GET/POST here and make a [id] route for DELETE/UPDATE.
