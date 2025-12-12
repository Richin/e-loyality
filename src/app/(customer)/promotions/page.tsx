import React from 'react';
import styles from './promotions.module.css';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const PROMOTIONS = [
    {
        id: 1,
        title: "Double Points Weekend",
        description: "Earn 2x points on all purchases in the Shop this coming weekend! No limit on earnings.",
        badge: "Limited Time",
        expiry: "Ends Sunday",
        colorStart: "#4facfe",
        colorEnd: "#00f2fe"
    },
    {
        id: 2,
        title: "New Member Bonus",
        description: "Just joined? Complete your profile to get a 50 point booster instantly added to your account.",
        badge: "Welcome Offer",
        expiry: "Valid for 7 days",
        colorStart: "#43e97b",
        colorEnd: "#38f9d7"
    },
    {
        id: 3,
        title: "Seasonal Clearance",
        description: "Shop from our seasonal collection and get up to 500 bonus points on selected items.",
        badge: "Hot Deal",
        expiry: "While stocks last",
        colorStart: "#fa709a",
        colorEnd: "#fee140"
    }
];

export default function PromotionsPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Deals & Promotions</h1>
                <p className={styles.subtitle}>Exclusive offers just for you</p>
            </header>

            <div className={styles.grid}>
                {PROMOTIONS.map((promo) => (
                    <div key={promo.id} className={styles.promoCard}>
                        <div
                            className={styles.promoImage}
                            style={{ background: `linear-gradient(135deg, ${promo.colorStart} 0%, ${promo.colorEnd} 100%)` }}
                        >
                            {/* In a real app, use next/image here */}
                            %
                        </div>
                        <div className={styles.promoContent}>
                            <span className={styles.promoBadge}>{promo.badge}</span>
                            <h3 className={styles.promoTitle}>{promo.title}</h3>
                            <p className={styles.promoDesc}>{promo.description}</p>
                            <div className={styles.promoExpiry}>
                                <span>🕒 {promo.expiry}</span>
                            </div>
                            <div style={{ marginTop: '1.5rem' }}>
                                <Link href="/shop" style={{ width: '100%' }}>
                                    <Button fullWidth variant="outline">Shop Now</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
