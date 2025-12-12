'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function ReferralsPage() {
    const [myCode, setMyCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/referrals')
            .then(res => res.json())
            .then(data => {
                if (data.code) setMyCode(data.code);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        setRedeeming(true);
        setMessage('');

        try {
            const res = await fetch('/api/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: inputCode })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Success: ${data.message}`);
                setInputCode('');
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setMessage('Error redeeming code');
        } finally {
            setRedeeming(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ marginBottom: '1rem' }}>Refer & Earn</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Invite friends and earn points for every successful referral.</p>

            {/* My Code Section */}
            <div style={{ marginBottom: '2rem' }}>
                <Card title="Your Referral Code" className="mb-4">
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        {loading ? (
                            <p>Generating Code...</p>
                        ) : (
                            <>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '2px',
                                    background: '#f0f0f0',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '2px dashed #ccc',
                                    marginBottom: '1rem'
                                }}>
                                    {myCode}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                    Share this code with your friends. You get <strong>100 pts</strong> when they join!
                                </p>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* Redeem Code Section */}
            <Card title="Have a Code?">
                <form onSubmit={handleRedeem}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Input
                            label="Enter Friend's Code"
                            name="referralCode"
                            fullWidth
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            placeholder="e.g. JOHN-1234"
                        />
                    </div>
                    {message && (
                        <p style={{
                            marginBottom: '1rem',
                            color: message.startsWith('Success') ? 'green' : 'red'
                        }}>
                            {message}
                        </p>
                    )}
                    <Button type="submit" fullWidth disabled={redeeming || !inputCode}>
                        {redeeming ? 'Redeeming...' : 'Redeem Code'}
                    </Button>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>
                        You will receive <strong>50 pts</strong> instantly.
                    </p>
                </form>
            </Card>
        </div>
    );
}
