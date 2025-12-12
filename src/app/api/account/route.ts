import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// UPDATE PASSWORD
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.password) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    return NextResponse.json({ message: 'Password updated successfully' });
}

// LOGOUT ALL DEVICES
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.user.update({
        where: { id: user.id },
        data: { tokenVersion: { increment: 1 } }
    });

    return NextResponse.json({ message: 'All other sessions invalidated' });
}

// DELETE ACCOUNT (GDPR)
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Prisma Cascade handles related MemberProfile
    await prisma.user.delete({
        where: { id: user.id }
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
}
