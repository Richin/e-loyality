import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to get/set setting
const getSetting = async (key: string) => {
    const s = await prisma.programSetting.findUnique({ where: { settingKey: key } });
    return s?.value || '';
};

export async function GET() {
    try {
        const settings = {
            emailProvider: await getSetting('email_provider'),
            emailApiKey: await getSetting('email_api_key'), // In real app, obscure this
            smsProvider: await getSetting('sms_provider'),
            smsSid: await getSetting('sms_sid'),
            smsAuthToken: await getSetting('sms_auth_token')
        };
        return NextResponse.json(settings);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Save each setting
        for (const [key, value] of Object.entries(body)) {
            // Basic upsert logic
            const existing = await prisma.programSetting.findUnique({ where: { settingKey: key } });
            if (existing) {
                await prisma.programSetting.update({ where: { id: existing.id }, data: { value: String(value) } });
            } else {
                await prisma.programSetting.create({ data: { settingKey: key, value: String(value) } });
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
