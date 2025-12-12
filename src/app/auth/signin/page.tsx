'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './auth.module.css';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError('Invalid email or password');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to your account</p>

                <form onSubmit={handleSubmit} className={styles.form}>
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

                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
                    <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
                    <span style={{
                        background: '#fff',
                        padding: '0 10px',
                        color: '#999',
                        fontSize: '0.85rem',
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}>OR</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => alert('OTP Login not implemented in this demo')}
                    >
                        📱 OTP / Mobile Login
                    </Button>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => alert('Google Login not implemented in this demo')}
                        >
                            Google
                        </Button>
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => alert('Facebook Login not implemented in this demo')}
                        >
                            Facebook
                        </Button>
                    </div>
                </div>

                <div className={styles.footer}>
                    <p>Don't have an account? <Link href="/auth/register">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
}
