'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import { Session } from 'next-auth';

export default function AuthButtons({ session }: { session: Session | null }) {
    if (session) {
        return (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'inherit' }}>
                    Hi, {session.user?.name?.split(' ')[0]}
                </span>
                <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                >
                    Sign Out
                </Button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/auth/signin" passHref>
                <Button variant="text" color="inherit" size="small">Log In</Button>
            </Link>
            <Link href="/auth/register" passHref>
                <Button variant="contained" color="secondary" size="small">Join Now</Button>
            </Link>
        </div>
    );
}
