'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/account', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage(data.message);
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutAll = async () => {
        if (!confirm('Are you sure? This will log you out of all devices including this one.')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/account', { method: 'POST' });
            if (res.ok) {
                alert('All sessions invalidated. Logging out...');
                signOut({ callbackUrl: '/auth/signin' });
            }
        } catch (err) {
            alert('Failed to logout');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = prompt('Type "DELETE" to confirm account deletion. This action is irreversible.');
        if (confirmDelete !== 'DELETE') return;

        setLoading(true);
        try {
            const res = await fetch('/api/account', { method: 'DELETE' });
            if (res.ok) {
                alert('Account deleted successfully.');
                signOut({ callbackUrl: '/' });
            } else {
                alert('Failed to delete account');
            }
        } catch (err) {
            alert('Error deleting account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Account Settings</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Security Section */}
                <Card title="Security">
                    <form onSubmit={handleChangePassword}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Change Password</h3>
                        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                        {message && <div style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                required
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </Card>

                {/* Session Management */}
                <Card title="Session Management">
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        If you suspect unusual activity or just want to be safe, you can log out of all devices that are currently signed in to your account.
                    </p>
                    <button
                        onClick={handleLogoutAll}
                        style={{ background: '#f59e0b', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Log Out of All Devices
                    </button>
                </Card>

                {/* Danger Zone */}
                <Card title="Danger Zone" style={{ border: '1px solid #fee2e2' }}>
                    <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '4px' }}>
                        <h4 style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '0.5rem' }}>Delete Account</h4>
                        <p style={{ color: '#991b1b', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            style={{ background: '#dc2626', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Delete Account
                        </button>
                    </div>
                </Card>

            </div>
        </div>
    );
}
