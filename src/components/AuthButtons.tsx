'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Session } from 'next-auth';

export default function AuthButtons({ session }: { session: Session | null }) {
    if (session) {
        return (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    Hi, {session.user?.name?.split(' ')[0]}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                >
                    Sign Out
                </Button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/auth/signin">
                <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/auth/register">
                <Button size="sm">Join Now</Button>
            </Link>
        </div>
    );
}
