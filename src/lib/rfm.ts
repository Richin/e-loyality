import prisma from './prisma';

export async function calculateRFM(memberProfileId: string) {
    const transactions = await prisma.loyaltyTransaction.findMany({
        where: { memberProfileId },
        orderBy: { createdAt: 'desc' }
    });

    if (transactions.length === 0) {
        return { rfmScore: 0, clvValue: 0, segment: 'NEW' };
    }

    // 1. Recency (Days since last transaction)
    const lastDate = new Date(transactions[0].createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const recencyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Score R (1-5, 5 is best/most recent)
    let rScore = 1;
    if (recencyDays <= 7) rScore = 5;
    else if (recencyDays <= 30) rScore = 4;
    else if (recencyDays <= 60) rScore = 3;
    else if (recencyDays <= 90) rScore = 2;

    // 2. Frequency (Total count)
    const frequency = transactions.length;
    let fScore = 1;
    if (frequency >= 50) fScore = 5;
    else if (frequency >= 20) fScore = 4;
    else if (frequency >= 10) fScore = 3;
    else if (frequency >= 5) fScore = 2;

    // 3. Monetary (Total Points Earned ~ similar to spend)
    const monetary = transactions
        .filter(t => t.points > 0)
        .reduce((sum, t) => sum + t.points, 0);

    let mScore = 1;
    if (monetary >= 5000) mScore = 5;
    else if (monetary >= 2000) mScore = 4;
    else if (monetary >= 1000) mScore = 3;
    else if (monetary >= 500) mScore = 2;

    // Final Score
    const rfmScore = (rScore * 100) + (fScore * 10) + mScore;

    // Segment
    let segment = 'STANDARD';
    if (rfmScore >= 444) segment = 'VIP'; // High everything
    else if (rScore <= 2 && fScore >= 4) segment = 'AT_RISK'; // Was frequent, now absent
    else if (rScore >= 4 && fScore <= 2) segment = 'NEW_POTENTIAL'; // Recent but low freq
    else if (rScore <= 1) segment = 'CHURNED';

    // Update DB
    await prisma.memberProfile.update({
        where: { id: memberProfileId },
        data: {
            rfmScore,
            clvValue: monetary,
            segment
        }
    });

    return { rfmScore, clvValue: monetary, segment };
}
