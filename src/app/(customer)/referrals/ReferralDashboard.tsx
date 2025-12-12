'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';

interface ReferralProps {
    referralCode: string;
    referrals: any[]; // Type would be MemberProfile[]
    totalEarned: number;
}

export default function ReferralDashboard({ referralCode, referrals, totalEarned }: ReferralProps) {
    const [copied, setCopied] = useState(false);
    // Safe access to window
    const [referralLink, setReferralLink] = useState('');

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setReferralLink(`${window.location.origin}/auth/register?ref=${referralCode}`);
        }
    }, [referralCode]);

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '2rem' }}>
                {/* Referral Code Card */}
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <h3 style={{ margin: 0, opacity: 0.9 }}>Your Referral Code</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0', letterSpacing: '4px' }}>
                            {referralCode || '----'}
                        </div>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                            Share this code with friends and earn 500 points for every signup!
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <Button variant="secondary" onClick={handleCopy} size="sm">
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* QR Code Card */}
                <Card>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Scan to Join</h3>
                        {referralLink && (
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
                                <QRCodeSVG value={referralLink} size={120} />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Stats Card */}
                <Card>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Total Earned</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                            {totalEarned.toLocaleString()} pts
                        </div>
                        <p style={{ color: '#666' }}>from {referrals.length} referrals</p>
                    </div>
                </Card>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Your Referrals</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {referrals.length === 0 ? (
                    <Card><p style={{ textAlign: 'center', color: '#666' }}>No referrals yet. Start sharing!</p></Card>
                ) : (
                    referrals.map((ref: any, idx: number) => (
                        <Card key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{ref.user?.name || 'Friend'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {ref.userId}</div>
                                </div>
                                <div style={{ color: '#27ae60', fontWeight: 'bold' }}>+500 pts</div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
