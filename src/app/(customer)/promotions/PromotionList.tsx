'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Promotion {
    id: string;
    title: string;
    description: string;
    discountValue: string;
    type: string;
    code: string | null;
    endDate: string | null;
    imageUrl: string | null;
}

export default function PromotionList() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await fetch('/api/promotions');
                if (res.ok) {
                    const data = await res.json();
                    setPromotions(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const Countdown = ({ targetDate }: { targetDate: string }) => {
        const [timeLeft, setTimeLeft] = useState('');

        useEffect(() => {
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const distance = new Date(targetDate).getTime() - now;

                if (distance < 0) {
                    clearInterval(interval);
                    setTimeLeft('EXPIRED');
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                setTimeLeft(`${days}d ${hours}h remaining`);
            }, 1000);

            return () => clearInterval(interval);
        }, [targetDate]);

        return <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '0.85rem' }}>⏰ {timeLeft}</span>;
    };

    if (loading) return <div>Loading offers...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {promotions.length === 0 ? (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>No active offers at the moment.</p>
            ) : (
                promotions.map(promo => (
                    <Card key={promo.id}>
                        <div style={{ position: 'relative' }}>
                            {/* Type Badge */}
                            <span style={{
                                position: 'absolute', top: '-10px', right: '-10px',
                                background: '#3498db', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                            }}>
                                {promo.type}
                            </span>

                            <h3 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>{promo.title}</h3>
                            <h2 style={{ color: '#27ae60', margin: '0 0 1rem 0' }}>{promo.discountValue}</h2>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>{promo.description}</p>

                            {promo.code && (
                                <div style={{
                                    background: '#f8f9fa', border: '1px dashed #ccc', padding: '0.5rem',
                                    textAlign: 'center', marginBottom: '1rem', borderRadius: '4px', fontWeight: 'bold'
                                }}>
                                    {promo.code}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                {promo.endDate ? <Countdown targetDate={promo.endDate} /> : <span></span>}
                                <Button size="sm" onClick={() => alert('Offer details opened!')}>View Details</Button>
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
}
