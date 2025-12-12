import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { action, targetProfileId, reason, ...data } = body;
    // @ts-ignore
    const adminId = session.user.id;

    if (!targetProfileId) return NextResponse.json({ error: 'Missing target' }, { status: 400 });

    try {
        let result;

        switch (action) {
            case 'ADJUST_POINTS':
                // data: { amount: 100 } (positive or negative)
                result = await prisma.$transaction(async (tx) => {
                    const profile = await tx.memberProfile.update({
                        where: { id: targetProfileId },
                        data: { pointsBalance: { increment: data.amount } }
                    });

                    // Log Transaction
                    await tx.loyaltyTransaction.create({
                        data: {
                            memberProfileId: targetProfileId,
                            type: data.amount > 0 ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_DEDUCT',
                            points: data.amount,
                            description: reason || 'Admin Adjustment',
                            source: 'ADMIN_CONSOLE'
                        }
                    });

                    return profile;
                });
                break;

            case 'ADJUST_WALLET':
                // data: { type: 'CASHBACK' | 'PREPAID', amount: 5.00 }
                const field = data.type === 'CASHBACK' ? 'cashbackBalance' : 'prepaidBalance';
                result = await prisma.memberProfile.update({
                    where: { id: targetProfileId },
                    data: { [field]: { increment: data.amount } }
                });
                break;

            case 'UPDATE_PROFILE':
                // data: { name, phone, dateOfBirth }
                result = await prisma.$transaction(async (tx) => {
                    // Update User (Name)
                    if (data.name) {
                        const profile = await tx.memberProfile.findUnique({ where: { id: targetProfileId } });
                        if (profile) {
                            await tx.user.update({
                                where: { id: profile.userId },
                                data: { name: data.name }
                            });
                        }
                    }
                    // Update Profile (Phone, DOB)
                    return await tx.memberProfile.update({
                        where: { id: targetProfileId },
                        data: {
                            phone: data.phone,
                            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
                        }
                    });
                });
                break;

            case 'FORCE_TIER':
                // data: { tierId: 'xyz' }
                result = await prisma.memberProfile.update({
                    where: { id: targetProfileId },
                    data: { currentTierId: data.tierId }
                });
                break;

            case 'SUSPEND_USER':
                // Toggle isSuspended on the User model (derived from profile)
                const profile = await prisma.memberProfile.findUnique({ where: { id: targetProfileId } });
                if (!profile) throw new Error('Profile not found');

                result = await prisma.user.update({
                    where: { id: profile.userId },
                    data: { isSuspended: data.suspend } // true or false
                });
                break;

            case 'MERGE_ACCOUNTS':
                // data: { sourceProfileId: 'duplicate' }
                // targetProfileId is the 'Keep' account
                if (!data.sourceProfileId) throw new Error('Missing source for merge');

                result = await prisma.$transaction(async (tx) => {
                    // 1. Get Source Info
                    const source = await tx.memberProfile.findUnique({ where: { id: data.sourceProfileId } });
                    if (!source) throw new Error('Source not found');

                    // 2. Transfer Points
                    await tx.memberProfile.update({
                        where: { id: targetProfileId },
                        data: { pointsBalance: { increment: source.pointsBalance } }
                    });

                    // 3. Move Transactions
                    await tx.loyaltyTransaction.updateMany({
                        where: { memberProfileId: data.sourceProfileId },
                        data: { memberProfileId: targetProfileId }
                    });

                    // 4. Move Redemptions
                    await tx.redemption.updateMany({
                        where: { memberProfileId: data.sourceProfileId },
                        data: { memberProfileId: targetProfileId }
                    });

                    // 5. Delete Source (Cascade Delete User should handle profile, but let's be safe)
                    await tx.user.delete({
                        where: { id: source.userId }
                    });

                    return { merged: true, transferredPoints: source.pointsBalance };
                });
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                adminId,
                targetId: targetProfileId,
                action,
                details: JSON.stringify({ ...data, reason })
            }
        });

        return NextResponse.json({ success: true, result });

    } catch (error: any) {
        console.error('CRM Action Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
