import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all settings
export async function GET(req: Request) {
    const settings = await prisma.programSetting.findMany();
    // Transform to object { key: value }
    const config: Record<string, string> = {};
    settings.forEach(s => config[s.settingKey] = s.value);
    return NextResponse.json(config);
}

// POST: Update settings
export async function POST(req: Request) {
    const body = await req.json();

    // Loop through keys and upsert
    for (const [key, value] of Object.entries(body)) {
        await prisma.programSetting.upsert({
            where: { settingKey: key },
            update: { value: String(value) },
            create: { settingKey: key, value: String(value) }
        });
    }

    return NextResponse.json({ message: 'Settings updated' });
}
