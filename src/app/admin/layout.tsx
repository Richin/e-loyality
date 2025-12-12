
'use client';

import React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Sidebar from '@/components/admin/Sidebar';
import Link from 'next/link';
import Button from '@mui/material/Button';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Admin Portal
                    </Typography>
                    <Button color="inherit" component={Link} href="/dashboard">
                        Exit to App
                    </Button>
                </Toolbar>
            </AppBar>

            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}> // Toolbar height offset
                {children}
            </Box>
        </Box>
    );
}
