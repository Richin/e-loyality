import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const roles = await prisma.role.findMany({
            include: { _count: { select: { users: true } } }
        });
        return NextResponse.json(roles);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// Quick seed endpoint or create
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const role = await prisma.role.create({
            data: {
                name: body.name,
                description: body.description
            }
        });
        return NextResponse.json(role);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
