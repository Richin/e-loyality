import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to validate API Key
async function validateApiKey(req: Request) {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) return false;

    const validKey = await prisma.apiKey.findUnique({
        where: { key: apiKey }
    });

    return validKey && validKey.isActive ? validKey : false;
}

export async function POST(req: Request) {
    try {
        const keyData = await validateApiKey(req);
        if (!keyData) {
            return NextResponse.json({ message: 'Forbidden: Invalid API Key' }, { status: 403 });
        }

        const body = await req.json();
        const { userEmail, phone, amount, transactionRef } = body;

        if (!amount || (!userEmail && !phone)) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Find user by email OR phone
        const profile = await prisma.memberProfile.findFirst({
            where: {
                OR: [
                    { user: { email: userEmail } },
                    { phone: phone }
                ]
            }
        });

        if (!profile) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Calculate points (e.g., 1 point per $1)
        const pointsEarned = Math.floor(amount);

        // Transaction
        const updatedProfile = await prisma.$transaction(async (tx) => {
            // Update last used for API Key
            await tx.apiKey.update({
                where: { id: keyData.id },
                data: { lastUsedAt: new Date() }
            });

            // Create Transaction
            await tx.loyaltyTransaction.create({
                data: {
                    memberProfileId: profile.id,
                    type: 'EARN',
                    points: pointsEarned,
                    amount: Number(amount),
                    description: `POS Transaction (Ref: ${transactionRef || 'N/A'})`
                }
            });

            // Update Balance
            return await tx.memberProfile.update({
                where: { id: profile.id },
                data: { pointsBalance: { increment: pointsEarned } }
            });
        });

        return NextResponse.json({
            message: 'Transaction processed successfully',
            pointsEarned,
            newBalance: updatedProfile.pointsBalance
        });

    } catch (error) {
        console.error('External API Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
