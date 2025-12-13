
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import DigitalCard from '@/components/DigitalCard';
import StatCard from '@/components/customer/StatCard';
import ActionTile from '@/components/customer/ActionTile';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import LoyaltyRoundedIcon from '@mui/icons-material/LoyaltyRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import RedeemRoundedIcon from '@mui/icons-material/RedeemRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

interface RewardItem {
    id: string;
    name: string;
    description: string | null;
    pointsCost: number;
    category: string;
}

interface ActivityItem {
    id: string;
    description: string | null;
    type: string;
    points: number;
    createdAt: string;
    storeName: string | null;
}

interface DashboardStats {
    monthEarned: number;
    monthRedeemed: number;
    netPoints: number;
    openTickets: number;
}

interface DashboardProfile {
    id: string;
    pointsBalance: number;
    pendingPoints: number;
    expiredPoints: number;
    pointsExpiryDate: string | null;
    cashbackBalance: number;
    prepaidBalance: number;
    currentStreak?: number;
    lastVisitDate?: string | null;
    tier: {
        name: string;
    } | null;
}

interface DashboardUser {
    name: string | null;
    email: string | null;
    role: string;
}

interface DashboardViewProps {
    user: DashboardUser;
    profile: DashboardProfile;
    recentActivity: ActivityItem[];
    featuredRewards: RewardItem[];
    stats: DashboardStats;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
});

export default function DashboardView({ user, profile, recentActivity, featuredRewards, stats }: DashboardViewProps) {
    const friendlyName = user.name?.split(' ')[0] ?? 'there';

    const nextTier = useMemo(() => {
        if (user.role?.toUpperCase().includes('ADMIN')) return null;
        if (profile.pointsBalance < 1000) return { name: 'Silver', threshold: 1000 };
        if (profile.pointsBalance < 5000) return { name: 'Gold', threshold: 5000 };
        return null;
    }, [profile.pointsBalance, user.role]);

    const progress = nextTier ? Math.min((profile.pointsBalance / nextTier.threshold) * 100, 100) : 100;
    const expiryDate = profile.pointsExpiryDate ? new Date(profile.pointsExpiryDate) : null;
    const expiryLabel = expiryDate ? DATE_FORMATTER.format(expiryDate) : 'No points expiring soon';

    const lastVisit = profile.lastVisitDate ? new Date(profile.lastVisitDate) : null;
    const lastVisitLabel = lastVisit ? DATE_FORMATTER.format(lastVisit) : 'No recent visits logged';

    const insightCards = [
        {
            title: 'Points earned this month',
            value: `${stats.monthEarned.toLocaleString()} pts`,
            caption: 'Includes bonus campaigns',
            icon: TrendingUpRoundedIcon,
            color: 'primary.main',
        },
        {
            title: 'Points redeemed',
            value: `${stats.monthRedeemed.toLocaleString()} pts`,
            caption: 'Rewards claimed this month',
            icon: RedeemRoundedIcon,
            color: 'secondary.main',
        },
        {
            title: 'Net balance change',
            value: `${stats.netPoints >= 0 ? '+' : '-'}${Math.abs(stats.netPoints).toLocaleString()} pts`,
            caption: 'After redemptions',
            icon: StarOutlineRoundedIcon,
            color: stats.netPoints >= 0 ? 'success.main' : 'error.main',
        },
    ];

    const quickActions = [
        {
            title: 'Redeem rewards',
            href: '/catalog',
            icon: CardGiftcardRoundedIcon,
            color: 'primary.main',
            description: 'Browse the latest catalog',
        },
        {
            title: 'Refer & earn',
            href: '/referrals',
            icon: PeopleAltRoundedIcon,
            color: 'secondary.main',
            description: 'Invite friends to join',
        },
        {
            title: 'View history',
            href: '/history',
            icon: HistoryRoundedIcon,
            color: 'info.main',
            description: 'Track your transactions',
        },
        {
            title: 'Need support?',
            href: '/support',
            icon: SupportAgentRoundedIcon,
            color: 'warning.main',
            description: stats.openTickets > 0 ? `${stats.openTickets} ticket(s) open` : 'Chat with the team',
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    gap: { xs: 3, lg: 4 },
                    alignItems: 'stretch',
                }}
            >
                <Box sx={{ flex: '1 1 0%', display: 'flex' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '28px',
                            px: { xs: 3, md: 4 },
                            py: { xs: 1.75, md: 2.5 },
                            position: 'relative',
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 60%, #7c3aed 100%)',
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: 310,
                            width: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 55%)',
                            }}
                        />
                        <Stack spacing={2} sx={{ position: 'relative' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Chip
                                    label={`Tier ${profile.tier?.name ?? 'Member'}`}
                                    color="secondary"
                                    variant="filled"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 600 }}
                                />
                                <Chip
                                    label={DAY_FORMATTER.format(new Date())}
                                    variant="outlined"
                                    sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', fontWeight: 500 }}
                                />
                            </Stack>

                            <Typography variant="h4" fontWeight={700} sx={{ maxWidth: 420, lineHeight: 1.35 }}>
                                Welcome back, {friendlyName}.
                            </Typography>

                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                                        {nextTier ? `Progress to ${nextTier.name}` : 'Elite status unlocked'}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {nextTier
                                            ? `${profile.pointsBalance.toLocaleString()} / ${nextTier.threshold.toLocaleString()} pts`
                                            : `${profile.pointsBalance.toLocaleString()} pts`}
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: 'rgba(255,255,255,0.25)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'white',
                                        },
                                    }}
                                />
                                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                    {nextTier
                                        ? `Only ${(nextTier.threshold - profile.pointsBalance).toLocaleString()} points away from ${nextTier.name} status.`
                                        : 'You’re enjoying our highest tier benefits. Keep exploring exclusive perks!'}
                                </Typography>
                            </Stack>

                            <Divider light sx={{ borderColor: 'rgba(255,255,255,0.25)' }} />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {profile.pointsBalance.toLocaleString()} pts
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                        Total balance available
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {profile.pendingPoints.toLocaleString()} pts
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                        Pending approval
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {expiryLabel}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                        Next expiry
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Paper>
                </Box>

                <Box sx={{ flex: '1 1 0%', display: 'flex', alignItems: 'stretch' }}>
                    <DigitalCard
                        name={user.name || 'Valued Member'}
                        memberId={profile.id}
                        tier={profile.tier?.name || 'Bronze'}
                        points={profile.pointsBalance}
                    />
                </Box>
            </Box>

            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={700}>
                        Wallet overview
                    </Typography>
                </Stack>
                <Box
                    sx={{
                        display: 'grid',
                        gap: 3,
                        gridTemplateColumns: {
                            xs: 'repeat(1, minmax(0, 1fr))',
                            sm: 'repeat(2, minmax(0, 1fr))',
                            md: 'repeat(3, minmax(0, 1fr))',
                            xl: 'repeat(6, minmax(0, 1fr))',
                        },
                    }}
                >
                    <Box>
                        <StatCard
                            title="Loyalty points"
                            value={profile.pointsBalance.toLocaleString()}
                            icon={<LoyaltyRoundedIcon />}
                            color="#f59e0b"
                            subtitle={`${profile.pendingPoints.toLocaleString()} pending approval`}
                        />
                    </Box>
                    <Box>
                        <StatCard
                            title="Cashback balance"
                            value={`$${profile.cashbackBalance.toFixed(2)}`}
                            icon={<AccountBalanceWalletRoundedIcon />}
                            color="#10b981"
                            subtitle="Available to spend"
                        />
                    </Box>
                    <Box>
                        <StatCard
                            title="Prepaid wallet"
                            value={`$${profile.prepaidBalance.toFixed(2)}`}
                            icon={<CreditCardRoundedIcon />}
                            color="#6366f1"
                            subtitle="Top up anytime"
                        />
                    </Box>
                    {insightCards.map((card) => (
                        <Paper
                            key={card.title}
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                height: '100%',
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        bgcolor: `${card.color}15`,
                                        color: card.color,
                                        borderRadius: 2,
                                        width: 44,
                                        height: 44,
                                    }}
                                >
                                    <card.icon fontSize="medium" />
                                </Avatar>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {card.title}
                                </Typography>
                            </Stack>
                            <Typography variant="h4" fontWeight={700}>
                                {card.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {card.caption}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </Box>

            <Box>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                    Quick actions
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                            xs: 'repeat(1, minmax(0, 1fr))',
                            sm: 'repeat(2, minmax(0, 1fr))',
                            md: 'repeat(4, minmax(0, 1fr))',
                        },
                    }}
                >
                    {quickActions.map((action) => (
                        <ActionTile key={action.title} {...action} />
                    ))}
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    gap: { xs: 3, lg: 4 },
                    alignItems: 'stretch',
                }}
            >
                <Box sx={{ flex: { xs: '1 1 auto', lg: '0 0 38%' } }}>
                    <Paper elevation={0} sx={{ borderRadius: 4, p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                            <ReceiptLongRoundedIcon color="primary" />
                            <Typography variant="h6" fontWeight={700}>
                                Recent activity
                            </Typography>
                        </Stack>
                        {recentActivity.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography variant="body2">No transactions yet. Start earning points to see your history here.</Typography>
                            </Box>
                        ) : (
                            <TableContainer sx={{ borderRadius: 3 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Activity</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell align="right">Points</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentActivity.map((item) => {
                                            const created = DATE_FORMATTER.format(new Date(item.createdAt));
                                            const positive = item.points >= 0;
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Stack spacing={0.5}>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                {item.description || item.type}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {item.storeName || 'Online'}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{created}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={700}
                                                            color={positive ? 'success.main' : 'error.main'}
                                                        >
                                                            {positive ? '+' : ''}
                                                            {item.points.toLocaleString()} pts
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button component={Link} href="/history" size="small">
                                View full history
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ flex: { xs: '1 1 auto', lg: '1 1 0%' } }}>
                    <Paper elevation={0} sx={{ borderRadius: 4, p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                            <ScheduleRoundedIcon color="primary" />
                            <Typography variant="h6" fontWeight={700}>
                                Handpicked rewards for you
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: {
                                    xs: 'repeat(1, minmax(0, 1fr))',
                                    md: 'repeat(3, minmax(0, 1fr))',
                                },
                            }}
                        >
                            {featuredRewards.map((reward) => (
                                <Paper
                                    key={reward.id}
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        height: '100%',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.5,
                                    }}
                                >
                                    <Stack spacing={1}>
                                        <Chip
                                            label={reward.category}
                                            size="small"
                                            sx={{
                                                alignSelf: 'flex-start',
                                                bgcolor: 'primary.light',
                                                color: 'primary.contrastText',
                                                fontWeight: 600,
                                            }}
                                        />
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {reward.name}
                                        </Typography>
                                        {reward.description && (
                                            <Typography variant="body2" color="text.secondary">
                                                {reward.description}
                                            </Typography>
                                        )}
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 'auto' }}>
                                        <Chip
                                            label={`${reward.pointsCost.toLocaleString()} pts`}
                                            color="primary"
                                            variant="outlined"
                                            sx={{ fontWeight: 600 }}
                                        />
                                        <Button component={Link} href="/catalog" size="small">
                                            View reward
                                        </Button>
                                    </Stack>
                                </Paper>
                            ))}
                        </Box>

                        {featuredRewards.length === 0 && (
                            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography variant="body2">No featured rewards right now. Check back soon for new offers.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 4, p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                    <Stack spacing={1}>
                        <Typography variant="h6" fontWeight={700}>
                            Keep your streak alive
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {profile.currentStreak
                                ? `You’ve checked in ${profile.currentStreak} day${profile.currentStreak === 1 ? '' : 's'} in a row.`
                                : 'Visit us today to start earning daily streak bonuses.'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Last visit: {lastVisitLabel}
                        </Typography>
                    </Stack>
                    <Tooltip title="Open your history to keep the momentum going" arrow>
                        <Button component={Link} href="/history" variant="contained" color="primary">
                            Continue earning
                        </Button>
                    </Tooltip>
                </Stack>
            </Paper>
        </Box>
    );
}
