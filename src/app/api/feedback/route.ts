import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Admin only - List all feedback
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        // In real app, check if user is admin
        const feedbacks = await prisma.feedback.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(feedbacks);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching feedback' }, { status: 500 });
    }
}

// POST: Submit feedback
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // Allow anonymous usage if needed, but we track userId if logged in
    const userId = session?.user?.email ? (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id : null;

    try {
        const body = await req.json();
        const { category, message, rating } = body;

        await prisma.feedback.create({
            data: {
                userId,
                category,
                message,
                rating: Number(rating)
            }
        });

        return NextResponse.json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error submitting feedback' }, { status: 500 });
    }
}
