import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const settings = await prisma.programSetting.findMany();
        // Convert array to object for easier frontend consumption
        const settingsMap: Record<string, string> = {};
        settings.forEach(s => settingsMap[s.settingKey] = s.value);
        return NextResponse.json(settingsMap);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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
        const body = await req.json(); // { "earn_rate": "1.5", "currency": "$" }

        const updates = Object.entries(body).map(([key, value]) => {
            return prisma.programSetting.upsert({
                where: { settingKey: key },
                update: { value: String(value) },
                create: { settingKey: key, value: String(value) }
            });
        });

        await prisma.$transaction(updates);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
