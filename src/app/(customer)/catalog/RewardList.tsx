'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './catalog.module.css';
import { useRouter } from 'next/navigation';

interface Reward {
    id: string;
    name: string;
    description: string | null;
    pointsCost: number;
}

interface RewardListProps {
    rewards: Reward[];
    userPoints: number;
}

export default function RewardList({ rewards, userPoints }: RewardListProps) {
    const [redeeming, setRedeeming] = useState<string | null>(null);
    const router = useRouter();

    const handleRedeem = async (rewardId: string) => {
        if (!confirm('Are you sure you want to redeem this reward?')) return;

        setRedeeming(rewardId);
        try {
            const res = await fetch('/api/rewards/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rewardId }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.message || 'Redemption failed');
            } else {
                alert('Reward redeemed successfully!');
                router.refresh(); // Refresh to update points balance
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setRedeeming(null);
        }
    };

    return (
        <div className={styles.grid}>
            {rewards.map((reward) => {
                const canAfford = userPoints >= reward.pointsCost;
                return (
                    <Card key={reward.id} className={!canAfford ? styles.insufficient : ''}>
                        <div className={styles.rewardContent}>
                            <h3 className={styles.rewardName}>{reward.name}</h3>
                            <p className={styles.rewardDescription}>{reward.description}</p>
                            <div className={styles.rewardFooter}>
                                <span className={styles.pointsCost}>{reward.pointsCost} pts</span>
                                <Button
                                    size="sm"
                                    onClick={() => handleRedeem(reward.id)}
                                    disabled={!canAfford || redeeming === reward.id}
                                    variant={canAfford ? 'primary' : 'outline'}
                                >
                                    {redeeming === reward.id ? 'Processing...' : 'Redeem'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
