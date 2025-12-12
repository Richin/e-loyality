
'use client';

import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { ButtonBase } from '@mui/material';

interface ActionTileProps {
    title: string;
    icon: React.ReactElement;
    href: string;
    color?: string;
}

export default function ActionTile({ title, icon, href, color = 'primary.main' }: ActionTileProps) {
    return (
        <ButtonBase
            component={Link}
            href={href}
            sx={{ width: '100%', height: '100%', display: 'block', borderRadius: 3, overflow: 'hidden' }}
        >
            <Paper
                elevation={1}
                sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: `${color}08`, // Slight tint
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                    }
                }}
            >
                <Box sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: `${color}15`,
                    color: color,
                    display: 'flex'
                }}>
                    {React.cloneElement(icon as React.ReactElement<any>, { fontSize: 'large' })}
                </Box>
                <Typography variant="subtitle2" fontWeight="bold" align="center">
                    {title}
                </Typography>
            </Paper>
        </ButtonBase>
    );
}
