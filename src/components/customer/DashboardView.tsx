
'use client';

import React from 'react';
import Link from 'next/link';
import DigitalCard from '@/components/DigitalCard';

// MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';

interface DashboardViewProps {
    user: {
        name: string | null;
        email: string | null;
        role: string;
    };
    profile: {
        id: string;
        pointsBalance: number;
        pendingPoints: number;
        expiredPoints: number;
        pointsExpiryDate: Date | null;
        cashbackBalance: number | null;
        prepaidBalance: number | null;
        tier: {
            name: string;
        } | null;
    };
}

export default function DashboardView({ user, profile }: DashboardViewProps) {
    // Calculate Tier Progress
    const nextTier = user.role === 'ADMIN' ? null : (
        profile.pointsBalance < 1000 ? { name: 'Silver', threshold: 1000 } :
            profile.pointsBalance < 5000 ? { name: 'Gold', threshold: 5000 } : null
    );

    const progress = nextTier ? Math.min((profile.pointsBalance / nextTier.threshold) * 100, 100) : 100;

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Welcome back, {user.name}
                </Typography>
                <Typography color="text.secondary">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Column: Digital Card & Progress */}
                <Grid item xs={12} md={5}>
                    <DigitalCard
                        name={user.name || 'Valued Member'}
                        memberId={profile.id}
                        tier={profile.tier?.name || 'Bronze'}
                        points={profile.pointsBalance}
                    />

                    {nextTier && (
                        <Card sx={{ mt: 3, p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Progress to {nextTier.name}</Typography>
                                <Typography variant="body2" fontWeight="bold">{profile.pointsBalance} / {nextTier.threshold} pts</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
                        </Card>
                    )}
                </Grid>

                {/* Right Column: Wallet & Actions */}
                <Grid item xs={12} md={7}>
                    <Typography variant="h5" sx={{ mb: 2 }}>My Wallet</Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>Points Balance</Typography>
                                    <Typography variant="h4" color="primary">{profile.pointsBalance}</Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                            <span style={{ color: '#f57c00' }}>Pending</span>
                                            <span>{profile.pendingPoints}</span>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                            <span style={{ color: '#d32f2f' }}>Expired</span>
                                            <span>{profile.expiredPoints}</span>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>Cashback</Typography>
                                    <Typography variant="h4" sx={{ color: 'success.main' }}>
                                        ${profile.cashbackBalance?.toFixed(2) || '0.00'}
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>Available to spend</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>Prepaid</Typography>
                                    <Typography variant="h4" sx={{ color: 'secondary.main' }}>
                                        ${profile.prepaidBalance?.toFixed(2) || '0.00'}
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>Top up in store</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Typography variant="h5" sx={{ mb: 2 }}>Quick Actions</Typography>
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button component={Link} href="/catalog" variant="contained" fullWidth>Redeem Rewards</Button>
                                <Button component={Link} href="/referrals" variant="outlined" fullWidth>Refer & Earn</Button>
                                <Button component={Link} href="/history" variant="text" fullWidth>History</Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Typography variant="h5" sx={{ mb: 2 }}>Recommended</Typography>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 50, height: 50,
                                bgcolor: 'primary.light',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                🎁
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">Personalized Offer</Typography>
                                <Typography variant="body2" color="text.secondary">Check your inbox for exclusive deals!</Typography>
                            </Box>
                            <Button component={Link} href="/inbox" variant="outlined" size="small">View</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
