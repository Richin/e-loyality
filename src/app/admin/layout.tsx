'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Rewards', href: '/admin/rewards' },
        { label: 'Campaigns', href: '/campaigns' },
        { label: 'Marketing', href: '/admin/marketing' },
        { label: 'Vouchers', href: '/admin/vouchers' },
        { label: 'Tiers', href: '/admin/tiers' },
        { label: 'Rules', href: '/admin/program' },
        { label: 'Feedback', href: '/admin/feedback' },
        { label: 'Settings', href: '/admin/settings' },
    ];

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>Admin Panel</h2>
                </div>
                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className={styles.logout}>
                    <button onClick={() => signOut()} className={styles.logoutBtn}>
                        Sign Out
                    </button>
                </div>
            </aside>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
