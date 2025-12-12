
'use client';

import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactElement;
    color?: string;
    trend?: {
        value: string;
        positive: boolean;
    };
}

export default function StatCard({ title, value, subtitle, icon, color = 'primary.main', trend }: StatCardProps) {
    return (
        <Card elevation={2} sx={{ height: '100%', borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography color="text.secondary" fontWeight="medium" variant="body2">
                        {title}
                    </Typography>
                    {icon && (
                        <Box sx={{
                            p: 1,
                            borderRadius: '50%',
                            bgcolor: `${color}15`, // 15 = roughly 10% opacity hex
                            color: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {React.cloneElement(icon as React.ReactElement<any>, { fontSize: 'small' })}
                        </Box>
                    )}
                </Box>

                <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary', mb: 0.5 }}>
                    {value}
                </Typography>

                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}

                {trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                        <Typography
                            variant="caption"
                            fontWeight="bold"
                            sx={{
                                color: trend.positive ? 'success.main' : 'error.main',
                                bgcolor: trend.positive ? 'success.lighter' : 'error.lighter',
                                px: 0.5, py: 0.25, borderRadius: 1
                            }}
                        >
                            {trend.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            vs last month
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
