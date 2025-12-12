import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const users = await prisma.user.findMany({
            where: {
                roleId: { not: null } // Only users with a role
            },
            include: { role: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(users);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Identify User by email and attach Role
        const { email, roleId } = body;

        const user = await prisma.user.update({
            where: { email },
            data: { roleId },
            include: { role: true }
        });

        // Log Action
        await prisma.auditLog.create({
            data: {
                adminId: user.id, // Ideally requestor ID, but for quick dev using target
                action: 'ROLE_ASSIGN',
                targetId: user.id,
                details: `Assigned role ${user.role?.name}`
            }
        });

        return NextResponse.json(user);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
