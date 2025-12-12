import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './CustomerLayout.module.css';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <div className={`container ${styles.navContainer}`}>
                    <Link href="/" className={styles.logo}>
                        E-Loyalty
                    </Link>
                    <nav className={styles.nav}>
                        <Link href="/catalog">Rewards</Link>
                        <Link href="/promotions">Deals</Link>
                    </nav>
                    <div className={styles.auth}>
                        <Link href="/auth/signin">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button size="sm">Join Now</Button>
                        </Link>
                    </div>
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
