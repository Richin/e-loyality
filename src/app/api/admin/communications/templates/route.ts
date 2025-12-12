import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const templates = await prisma.messageTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(templates);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const template = await prisma.messageTemplate.create({
            data: {
                name: body.name,
                type: body.type, // EMAIL, SMS
                subject: body.subject,
                content: body.content,
                variables: JSON.stringify(body.variables || [])
            }
        });
        return NextResponse.json(template);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.messageTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
