import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CustomerHeader from '@/components/customer/CustomerHeader';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default async function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <CustomerHeader session={session} />

            <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
                {children}
            </Container>

            <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'white', borderTop: '1px solid #eee' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        &copy; 2024 E-Loyalty App. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}
