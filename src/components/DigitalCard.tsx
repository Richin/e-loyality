'use client';

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import Button from '@mui/material/Button';

interface DigitalCardProps {
    name: string;
    memberId: string;
    tier: string;
    points: number;
}

export default function DigitalCard({ name, memberId, tier, points }: DigitalCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    // Premium Gradients
    const getTierStyle = (tier: string) => {
        switch (tier.toUpperCase()) {
            case 'GOLD': return {
                background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 40%, #B38728 60%, #AA771C 100%)', // Gold metallic
                text: '#4a3b10'
            };
            case 'PLATINUM': return {
                background: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 40%, #bdc3c7 60%, #7f8c8d 100%)', // Platinum
                text: '#2c3e50'
            };
            case 'SILVER': return {
                background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 40%, #A9A9A9 60%, #808080 100%)', // Silver
                text: '#2c3e50'
            };
            default: return {
                background: 'linear-gradient(135deg, #1c1c1c 0%, #434343 100%)', // Matte Black (Bronze/Standard)
                text: '#ffffff'
            };
        }
    };

    const theme = getTierStyle(tier);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 3, // High Res
                backgroundColor: null,
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `e-loyalty-card-${memberId}.png`;
            link.click();
        } catch (err) {
            console.error("Failed to download card:", err);
            alert("Failed to download card. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div style={{ perspective: '1000px' }}>
            {/* Card Container */}
            <div ref={cardRef} style={{
                background: theme.background,
                borderRadius: '20px',
                padding: '24px',
                color: theme.text,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '1.586 / 1', // Credit card ratio
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.3s ease',
            }}
                className="digital-card"
            >
                {/* Glassmorphism Shine */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)',
                    pointerEvents: 'none'
                }} />

                {/* Header: Chip + Tier */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
                    {/* Fake EMV Chip */}
                    <div style={{
                        width: '45px',
                        height: '35px',
                        background: 'linear-gradient(135deg, #d4af37 0%, #a08020 100%)',
                        borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.2)' }} />
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '30%', width: '1px', background: 'rgba(0,0,0,0.2)' }} />
                        <div style={{ position: 'absolute', top: '30%', bottom: 0, right: '35%', width: '1px', background: 'rgba(0,0,0,0.2)' }} />
                        <div style={{ position: 'absolute', top: 0, bottom: '30%', left: '35%', width: '1px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>

                    <div style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        opacity: 0.8
                    }}>
                        {tier}
                    </div>
                </div>

                {/* Middle: ID */}
                <div style={{ zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '1.4rem', letterSpacing: '3px', fontWeight: 'bold', textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
                        {memberId.match(/.{1,4}/g)?.join(' ') || memberId}
                    </div>
                </div>

                {/* Footer: Name + QR + Points */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
                    <div>
                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', opacity: 0.7, marginBottom: '2px' }}>Card Holder</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{name}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', opacity: 0.7, marginBottom: '2px' }}>Points Balance</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{points.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: -10 }}>
                <Button variant="text" size="small" onClick={handleDownload} disabled={downloading} sx={{ textTransform: 'none', color: '#666' }}>
                    {downloading ? 'Prepare download...' : 'Download / Print Card'}
                </Button>
            </div>
        </div>
    );
}
