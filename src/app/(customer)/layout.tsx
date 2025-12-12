import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AuthButtons from '@/components/AuthButtons';
import styles from './CustomerLayout.module.css';

export default async function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <div className={`container ${styles.navContainer}`}>
                    <Link href="/dashboard" className={styles.logo}>
                        E-Loyalty
                    </Link>
                    <nav className={styles.nav}>
                        <Link href="/catalog">Rewards</Link>
                        <Link href="/promotions">Deals</Link>
                        <Link href="/achievements">Achievements</Link>
                        <Link href="/referrals">Referrals</Link>
                        <Link href="/support">Support</Link>
                        <Link href="/notifications">Alerts</Link>
                    </nav>

                    <AuthButtons session={session} />
                </div>
            </header>

            <main className={styles.main}>
                {children}
            </main>

            <footer className={styles.footer}>
                <div className="container">
                    <p className={styles.copy}>&copy; 2024 E-Loyalty App. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
