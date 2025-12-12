
'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButtons from '@/components/AuthButtons';

const NAV_LINKS = [
    { label: 'Rewards', href: '/catalog' },
    { label: 'Deals', href: '/promotions' },
    { label: 'Inbox', href: '/inbox' },
    { label: 'Stores', href: '/stores' },
];

export default function CustomerHeader({ session }: { session: any }) {
    const pathname = usePathname();

    return (
        <AppBar position="sticky" color="default" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
            <Container maxWidth={false}>
                <Toolbar disableGutters>
                    {/* Logo */}
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        href="/dashboard"
                        sx={{
                            mr: 4,
                            display: { xs: 'none', md: 'flex' },
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: 'primary.main',
                            textDecoration: 'none',
                        }}
                    >
                        E-LOYALTY
                    </Typography>

                    {/* Mobile Logo (Simplified) */}
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        href="/dashboard"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontWeight: 700,
                            color: 'primary.main',
                            textDecoration: 'none',
                        }}
                    >
                        E-LOYALTY
                    </Typography>

                    {/* Desktop Nav */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                        {NAV_LINKS.map((page) => (
                            <Button
                                key={page.label}
                                component={Link}
                                href={page.href}
                                sx={{
                                    my: 2,
                                    color: pathname === page.href ? 'primary.main' : 'text.secondary',
                                    display: 'block',
                                    fontWeight: pathname === page.href ? 700 : 400
                                }}
                            >
                                {page.label}
                            </Button>
                        ))}
                        {/* @ts-ignore */}
                        {['ADMIN', 'SUPER ADMIN', 'MANAGER'].includes(session?.user?.role || '') && (
                            <Button component={Link} href="/admin/dashboard" color="secondary">
                                Admin Panel
                            </Button>
                        )}
                    </Box>

                    {/* Auth Buttons */}
                    <Box sx={{ flexGrow: 0 }}>
                        <AuthButtons session={session} />
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
