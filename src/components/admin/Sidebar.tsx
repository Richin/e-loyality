
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StoreIcon from '@mui/icons-material/Store';
import CampaignIcon from '@mui/icons-material/Campaign';
import SecurityIcon from '@mui/icons-material/Security';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const DRAWER_WIDTH = 240;

const MENU_ITEMS = [
    { text: 'Dashboard', href: '/admin/dashboard', icon: <DashboardIcon /> },
    { text: 'Customers', href: '/admin/customers', icon: <PeopleIcon /> },
    { text: 'Transactions', href: '/admin/transactions', icon: <ReceiptIcon /> },
    { text: 'Rewards', href: '/admin/rewards', icon: <LoyaltyIcon /> },
    { text: 'Redemptions', href: '/admin/redemptions', icon: <LoyaltyIcon /> },
    { text: 'Marketing', href: '/admin/marketing', icon: <CampaignIcon /> },
    { text: 'Stores', href: '/admin/stores', icon: <StoreIcon /> },
    { text: 'Reports', href: '/admin/reports', icon: <BarChartIcon /> },
    { text: 'Finance', href: '/admin/finance', icon: <AttachMoneyIcon /> },
    { text: 'Insights', href: '/admin/insights', icon: <BarChartIcon /> },
    { text: 'Communications', href: '/admin/communications', icon: <CampaignIcon /> },
    { text: 'Security', href: '/admin/security', icon: <SecurityIcon /> },
    { text: 'Configuration', href: '/admin/configuration', icon: <SettingsIcon /> },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
            }}
        >
            <Toolbar>
                <Box sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'primary.main' }}>
                    E-Loyalty Admin
                </Box>
            </Toolbar>
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {MENU_ITEMS.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                selected={pathname === item.href || pathname.startsWith(item.href)}
                            >
                                <ListItemIcon sx={{ color: pathname === item.href ? 'primary.main' : 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}
