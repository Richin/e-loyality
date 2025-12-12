import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function LandingPage() {
    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            Unlock Exclusive Rewards with Every Purchase
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Join our loyalty program today and start earning points, cash back, and premium personalized offers.
                        </p>
                        <div className={styles.heroCta}>
                            <Link href="/auth/register">
                                <Button size="lg">Join for Free</Button>
                            </Link>
                            <Link href="/catalog">
                                <Button variant="outline" size="lg">Explore Rewards</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className={styles.features}>
                <div className="container">
                    <div className={styles.grid}>
                        <div className="card">
                            <h3>Earn Points</h3>
                            <p>Get points for every dollar you spend. Tier up for faster earning rates.</p>
                        </div>
                        <div className="card">
                            <h3>Personalized Deals</h3>
                            <p>Receive offers tailored just for you based on your shopping habits.</p>
                        </div>
                        <div className="card">
                            <h3>Birthday Treats</h3>
                            <p>We celebrate you with special gifts and double points on your birthday.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download App CTA (Placeholder) */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaCard}>
                        <h2>Ready to start saving?</h2>
                        <Link href="/auth/register">
                            <Button variant="secondary" size="lg">Sign Up Now</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
