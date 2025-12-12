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

    const getTierColor = (tier: string) => {
        switch (tier.toUpperCase()) {
            case 'GOLD': return 'linear-gradient(135deg, #ffd700 0%, #fdb931 100%)';
            case 'SILVER': return 'linear-gradient(135deg, #e0e0e0 0%, #bdc3c7 100%)';
            default: return 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)';
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2
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
        <div style={{ position: 'relative' }}>
            <div ref={cardRef} style={{
                background: getTierColor(tier),
                borderRadius: '16px',
                padding: '1.5rem',
                color: '#fff',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                marginBottom: '1rem', // Reduced margin to make room for button
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '200px'
            }}>
                <div style={{ zIndex: 1 }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.9 }}>E-Loyalty Member</h3>
                        <h2 style={{ margin: '0.5rem 0', fontSize: '1.8rem', fontWeight: 800 }}>{name}</h2>
                        <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>ID: {memberId}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8 }}>Tier</span>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{tier}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8 }}>Points</span>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{points.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    padding: '10px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}>
                    <QRCodeSVG value={memberId} size={100} />
                    <span style={{ color: '#333', fontSize: '0.7rem', marginTop: '5px', fontWeight: 'bold' }}>SCAN ME</span>
                </div>

                {/* Decorative background circle */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    pointerEvents: 'none'
                }} />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                <Button variant="outlined" size="small" onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'Downloading...' : 'Download Card'}
                </Button>
            </div>
        </div>
    );
}
