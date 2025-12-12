import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id }
        });

        if (!campaign) {
            return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
        }

        // Simulate sending process
        await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay

        const updatedCampaign = await prisma.campaign.update({
            where: { id },
            data: {
                status: 'SENT',
                sentAt: new Date()
            }
        });

        return NextResponse.json(updatedCampaign);
    } catch (error) {
        console.error('Error sending campaign:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
