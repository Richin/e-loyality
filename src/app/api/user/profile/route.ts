import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberProfile: {
                    include: {
                        userBadges: {
                            include: { badge: true }
                        }
                    }
                }
            }
        });

        if (!user || !user.memberProfile) {
            return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({
            name: user.name,
            email: user.email,
            phone: user.memberProfile.phone,
            dateOfBirth: user.memberProfile.dateOfBirth,
            optInMarketing: user.memberProfile.optInMarketing,
            badges: user.memberProfile.userBadges.map(ub => ub.badge)
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, phone, dateOfBirth, optInMarketing } = body;

        // Update User table (name)
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                memberProfile: {
                    update: {
                        phone,
                        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                        optInMarketing
                    }
                }
            },
            include: { memberProfile: true }
        });

        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
