import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const rewards = await prisma.reward.findMany({ orderBy: { pointsCost: 'asc' } });
    return NextResponse.json(rewards);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { name, description, pointsCost } = body;

        if (!name || !pointsCost) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        const reward = await prisma.reward.create({
            data: {
                name,
                description,
                pointsCost: Number(pointsCost),
                isActive: true
            }
        });

        return NextResponse.json(reward, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating reward' }, { status: 500 });
    }
}
