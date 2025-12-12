
'use client';

import React from 'react';
import Link from 'next/link';
import DigitalCard from '@/components/DigitalCard';
import StatCard from '@/components/customer/StatCard';
import ActionTile from '@/components/customer/ActionTile';

// MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import redeemIcon from '@mui/icons-material/CardGiftcard';
import historyIcon from '@mui/icons-material/History';
import peopleIcon from '@mui/icons-material/People';
import supportIcon from '@mui/icons-material/SupportAgent';


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
            {/* Hero Welcome */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #1e293b 30%, #3b82f6 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
                    Hello, {user.name?.split(' ')[0]}
                </Typography>
                <Typography color="text.secondary" variant="h6">
                    Here is your membership overview for today.
                </Typography>
            </Box>

            {/* Top Row: My Wallet (Full Width) */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>My Wallet</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            title="Loyalty Points"
                            value={profile.pointsBalance.toLocaleString()}
                            icon={<LoyaltyIcon />}
                            color="#f59e0b" // Amber
                            subtitle={`${profile.pendingPoints} Pending`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            title="Cashback"
                            value={`$${profile.cashbackBalance?.toFixed(2) || '0.00'}`}
                            icon={<AccountBalanceWalletIcon />}
                            color="#10b981" // Emerald
                            subtitle="Available to spend"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            title="Prepaid Balance"
                            value={`$${profile.prepaidBalance?.toFixed(2) || '0.00'}`}
                            icon={<CreditCardIcon />}
                            color="#6366f1" // Indigo
                            subtitle="Auto-reload is OFF"
                        />
                    </Grid>
                </Grid>
            </Box>

            <Grid container spacing={4}>
                {/* Left Column: Digital Card & Status (Smaller now that wallet is gone) */}
                <Grid item xs={12} md={3}>
                    <Box sx={{ position: 'sticky', top: 100 }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>My Card</Typography>
                        <DigitalCard
                            name={user.name || 'Valued Member'}
                            memberId={profile.id}
                            tier={profile.tier?.name || 'Bronze'}
                            points={profile.pointsBalance}
                        />

                        {nextTier && (
                            <Box sx={{ mt: 4, px: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'flex-end' }}>
                                    <Typography variant="subtitle2" color="text.secondary">Next Tier: {nextTier.name}</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="primary">{profile.pointsBalance} / {nextTier.threshold}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 12,
                                        borderRadius: 6,
                                        bgcolor: '#e2e8f0',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 6,
                                            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                                        }
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                    You need {nextTier.threshold - profile.pointsBalance} more points to reach {nextTier.name} status
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>

                {/* Right Column: Actions & Recommendations (Wider) */}
                <Grid item xs={12} md={9}>
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Quick Actions</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={4} md={3}>
                                <ActionTile title="Redeem Rewards" href="/catalog" icon={<redeemIcon.type />} color="#ec4899" />
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <ActionTile title="Refer & Earn" href="/referrals" icon={<peopleIcon.type />} color="#8b5cf6" />
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <ActionTile title="View History" href="/history" icon={<historyIcon.type />} color="#0ea5e9" />
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                                <ActionTile title="Support" href="/support" icon={<supportIcon.type />} color="#64748b" />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Recommendations */}
                    <Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>For You</Typography>
                        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Box sx={{
                                    width: 80, height: 80,
                                    bgcolor: '#eff6ff',
                                    borderRadius: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem'
                                }}>
                                    🎉
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="h6" fontWeight="bold">Exclusive Member Deal</Typography>
                                        <Chip label="New" size="small" color="primary" sx={{ height: 20, fontSize: '0.625rem' }} />
                                    </Box>
                                    <Typography variant="body1" color="text.secondary">Double points on all coffee purchases this weekend! Don't miss out on this limited time offer.</Typography>
                                </Box>
                                <Button component={Link} href="/promotions" variant="contained" size="large" sx={{ borderRadius: 2, px: 4 }}>
                                    Activate
                                </Button>
                            </Box>
                        </Card>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
