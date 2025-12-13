'use client';

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';

interface DigitalCardProps {
    name: string;
    memberId: string;
    tier: string;
    points: number;
}

const tierThemes = {
    GOLD: {
        gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%)',
        shadow: 'rgba(217, 119, 6, 0.45)',
        accent: '#fff7ed',
        on: '#2f1b03',
    },
    SILVER: {
        gradient: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 60%, #6b7280 100%)',
        shadow: 'rgba(55, 65, 81, 0.35)',
        accent: '#f9fafb',
        on: '#1f2937',
    },
    PLATINUM: {
        gradient: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 55%, #9ca3af 100%)',
        shadow: 'rgba(100, 116, 139, 0.35)',
        accent: '#f1f5f9',
        on: '#0f172a',
    },
    DEFAULT: {
        gradient: 'linear-gradient(135deg, #1f2937 0%, #111827 60%, #0f172a 100%)',
        shadow: 'rgba(15, 23, 42, 0.45)',
        accent: '#1f2937',
        on: '#f8fafc',
    },
} as const;

export default function DigitalCard({ name, memberId, tier, points }: DigitalCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const themeKey = (tier?.toUpperCase() as keyof typeof tierThemes) ?? 'DEFAULT';
    const theme = tierThemes[themeKey] ?? tierThemes.DEFAULT;

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 3,
                backgroundColor: null,
            });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `e-loyalty-card-${memberId}.png`;
            link.click();
        } catch (error) {
            console.error('Failed to download card:', error);
            alert('Failed to download card. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const formattedMemberId = memberId.match(/.{1,4}/g)?.join(' • ') ?? memberId;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Box
                ref={cardRef}
                sx={{
                    position: 'relative',
                    borderRadius: '26px',
                    p: { xs: 3, md: 4 },
                    color: theme.on,
                    backgroundImage: theme.gradient,
                    boxShadow: `0 24px 48px -20px ${theme.shadow}`,
                    overflow: 'hidden',
                    //nHeight: { xs: 200, md: 185 },
                    height: 310,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    flexGrow: 1,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 15% 20%, ${alpha('#ffffff', 0.25)}, transparent 55%)`,
                    }}
                />

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative' }}>
                    <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.7 }}>
                            Loyalty Tier
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6" fontWeight={700}>
                                {tier}
                            </Typography>
                        </Stack>
                    </Stack>
                    <Box
                        sx={{
                            width: 48,
                            height: 32,
                            borderRadius: 1.5,
                            background: alpha('#fef3c7', 0.6),
                            border: `1px solid ${alpha('#000', 0.1)}`,
                            position: 'relative',
                        }}
                    >
                        <Box sx={{ position: 'absolute', inset: '12%', border: `1px solid ${alpha('#000', 0.1)}` }} />
                        <Box sx={{ position: 'absolute', inset: '0 36% 0 36%', backgroundColor: alpha('#000', 0.12) }} />
                        <Box sx={{ position: 'absolute', inset: '45% 0 45% 0', backgroundColor: alpha('#000', 0.12) }} />
                    </Box>
                </Stack>

                <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2} sx={{ position: 'relative', flexGrow: 1 }}>
                    <Stack spacing={1.5} sx={{ mb: 1 }}>
                        <Box>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, display: 'block', mb: 0.5 }}>
                                Member
                            </Typography>
                            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5, textTransform: 'uppercase', lineHeight: 1.2 }}>
                                {name}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.5 }}>
                                Balance
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1 }}>
                                {points.toLocaleString()}
                            </Typography>
                        </Box>
                    </Stack>

                    <Box
                        sx={{
                            bgcolor: alpha(theme.accent, 0.9),
                            borderRadius: 3,
                            p: 1.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        <QRCodeSVG value={memberId} size={80} />
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: theme.on, fontSize: '0.65rem' }}>
                            Scan
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative', mt: 'auto', pt: 1, borderTop: `1px solid ${alpha(theme.on, 0.15)}` }}>
                    <Typography variant="caption" sx={{ letterSpacing: 2, fontFamily: 'monospace', opacity: 0.8 }}>
                        {formattedMemberId}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: 1 }}>
                        E-LOYALTY
                    </Typography>
                </Stack>
            </Box>

            <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Button variant="outlined" size="small" onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'Preparing card…' : 'Download card'}
                </Button>
            </Box>
        </Box>
    );
}
