'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Reuse auth styles
import styles from '../signin/auth.module.css';

// Component that uses useSearchParams must be wrapped in Suspense boundary in Next.js
function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            setReferralCode(ref);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    referralCode: referralCode || undefined
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Registration failed');
            } else {
                // Success - Redirect to login
                alert('Account created! Please sign in.');
                router.push('/auth/signin');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <Input
                label="Full Name"
                type="text"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <Input
                label="Email Address"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Input
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <Input
                label="Referral Code (Optional)"
                type="text"
                fullWidth
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="PROMO123"
            />

            {error && <div className={styles.errorAlert}>{error}</div>}

            <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
        </form>
    );
}

export default function RegisterPage() {
    return (
        <div className={styles.container}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className={styles.title}>Join E-Loyalty</h1>
                <p className={styles.subtitle}>Create your account to start earning</p>

                <Suspense fallback={<div>Loading form...</div>}>
                    <RegisterForm />
                </Suspense>

                <div className={styles.footer}>
                    <p>Already have an account? <Link href="/auth/signin">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
}
