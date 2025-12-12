import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notifyPointsEarned } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { storeId, transactions, apiKey } = body;

        // In production, validate apiKey against database
        // const validKey = await prisma.apiKey.findUnique({ where: { key: apiKey } });
        // if (!validKey) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

        // 1. Update Store Heartbeat
        if (storeId) {
            await prisma.store.update({
                where: { id: storeId },
                data: { lastSyncAt: new Date(), posStatus: 'ONLINE' }
            }).catch(console.error);
        }

        let processedCount = 0;
        let errors = 0;

        // 2. Process Transactions
        for (const tx of transactions) {
            try {
                // Find Member by Phone or Email or Card ID
                const member = await prisma.memberProfile.findFirst({
                    where: {
                        OR: [
                            { phone: tx.customerPhone },
                            { user: { email: tx.customerEmail } }
                        ]
                    },
                    include: { user: true }
                });

                if (member) {
                    // Create Transaction
                    const newTx = await prisma.loyaltyTransaction.create({
                        data: {
                            memberProfileId: member.id,
                            type: 'EARN',
                            points: tx.pointsEarned,
                            amount: tx.amount,
                            description: `POS Order #${tx.orderId} at Store`,
                            orderId: tx.orderId,
                            source: 'POS',
                            storeId: storeId,
                            isOfflineSync: true,
                            createdAt: new Date(tx.timestamp) // Use actual POS time
                        }
                    });

                    // Update Balance
                    await prisma.memberProfile.update({
                        where: { id: member.id },
                        data: {
                            pointsBalance: { increment: tx.pointsEarned },
                            lastVisitDate: new Date()
                        }
                    });

                    // Notify User
                    await notifyPointsEarned(member.id, tx.pointsEarned, `POS Order #${tx.orderId}`);
                    processedCount++;
                } else {
                    // Log orphan transaction or unknown user?
                    // For now, skip
                }
            } catch (e) {
                console.error('Error processing single POS tx', e);
                errors++;
            }
        }

        return NextResponse.json({ success: true, processed: processedCount, errors });

    } catch (error: any) {
        console.error('POS Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
