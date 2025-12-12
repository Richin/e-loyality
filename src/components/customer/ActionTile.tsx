
'use client';

import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { ButtonBase } from '@mui/material';

interface ActionTileProps {
    title: string;
    icon: React.ElementType;
    href: string;
    color?: string;
    description?: string;
}

export default function ActionTile({ title, icon: Icon, href, color = 'primary.main', description }: ActionTileProps) {
    return (
        <ButtonBase
            component={Link}
            href={href}
            sx={{ width: '100%', height: '100%', display: 'block', borderRadius: 3, overflow: 'hidden' }}
        >
            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: 1.5,
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s ease',
                    borderRadius: 3,
                    '&:hover': {
                        bgcolor: `${color}10`,
                        transform: 'translateY(-3px)',
                        boxShadow: 6
                    }
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: '14px',
                        bgcolor: `${color}12`,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {title}
                    </Typography>
                    {description && (
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    )}
                </Box>
            </Paper>
        </ButtonBase>
    );
}
