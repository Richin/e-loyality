'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './catalog.module.css';
import { useRouter } from 'next/navigation';

interface Reward {
    id: string;
    name: string;
    description: string | null;
    pointsCost: number;
    category: string;
    type: string;
}

interface RewardListProps {
    rewards: Reward[];
    userPoints: number;
}

const CATEGORIES = ['ALL', 'VOUCHER', 'FOOD', 'MERCH', 'OTHER'];

export default function RewardList({ rewards, userPoints }: RewardListProps) {
    const [redeeming, setRedeeming] = useState<string | null>(null);
    const [filter, setFilter] = useState('ALL');
    const router = useRouter();

    const filteredRewards = useMemo(() => {
        if (filter === 'ALL') return rewards;
        return rewards.filter(r => r.category === filter);
    }, [rewards, filter]);

    const handleRedeem = async (rewardId: string) => {
        if (!confirm('Are you sure you want to redeem this reward?')) return;

        setRedeeming(rewardId);
        try {
            const res = await fetch('/api/rewards/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rewardId }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Redemption failed');
            } else {
                let message = 'Reward redeemed successfully!';
                if (data.code) {
                    message += `\nYour Code: ${data.code}`;
                }
                alert(message);
                router.refresh();
                router.push('/rewards'); // Redirect to My Rewards
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setRedeeming(null);
        }
    };

    return (
        <div>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '5px' }}>
                {CATEGORIES.map(cat => (
                    <Button
                        key={cat}
                        size="sm"
                        variant={filter === cat ? 'primary' : 'outline'}
                        onClick={() => setFilter(cat)}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            <div className={styles.grid}>
                {filteredRewards.length === 0 ? (
                    <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>No rewards found in this category.</p>
                ) : (
                    filteredRewards.map((reward) => {
                        const canAfford = userPoints >= reward.pointsCost;
                        return (
                            <Card key={reward.id} className={!canAfford ? styles.insufficient : ''}>
                                <div className={styles.rewardContent}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#f0f0f0', color: '#666' }}>
                                            {reward.category}
                                        </span>
                                        {reward.type === 'PHYSICAL' && <span style={{ fontSize: '1.2rem' }}>📦</span>}
                                        {reward.type === 'DIGITAL' && <span style={{ fontSize: '1.2rem' }}>🎫</span>}
                                    </div>
                                    <h3 className={styles.rewardName} style={{ marginTop: '0.5rem' }}>{reward.name}</h3>
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
                    })
                )}
            </div>
        </div>
    );
}
