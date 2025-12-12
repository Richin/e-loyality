'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        optInMarketing: false
    });

    const [badges, setBadges] = useState<any[]>([]);

    useEffect(() => {
        // Trigger badge check first
        fetch('/api/badges/assign', { method: 'POST' });

        // Fetch current profile
        fetch('/api/user/profile')
            .then(res => res.json())
            .then(data => {
                if (data.name) {
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                        optInMarketing: data.optInMarketing || false
                    });
                    if (data.badges) setBadges(data.badges);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: 'error', text: 'Failed to load profile' });
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to update');

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            router.refresh(); // Refresh server components (like Dashboard name)
        } catch (error) {
            setMessage({ type: 'error', text: 'Error updating profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>My Profile</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Manage your account details and preferences.</p>

            <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {message.text && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        borderRadius: '6px',
                        background: message.type === 'success' ? '#e6f4ea' : '#fce8e6',
                        color: message.type === 'success' ? '#1e7e34' : '#c62828'
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                    <Input
                        label="Full Name"
                        name="name"
                        fullWidth
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <Input
                        label="Email Address"
                        name="email"
                        fullWidth
                        value={formData.email}
                        disabled // Email cannot be changed easily
                        style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <Input
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        fullWidth
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <Input
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        fullWidth
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                    />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' }} />

                <h3 style={{ marginBottom: '1rem' }}>Consent & Preferences</h3>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <input
                        type="checkbox"
                        id="optInMarketing"
                        name="optInMarketing"
                        checked={formData.optInMarketing}
                        onChange={handleChange}
                        style={{ marginTop: '0.3rem', width: '20px', height: '20px' }}
                    />
                    <label htmlFor="optInMarketing" style={{ fontSize: '0.95rem', color: '#333' }}>
                        <strong>I agree to receive marketing updates</strong><br />
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                            By checking this box, you consent to the collection, use, and disclosure of your personal data by us for the purpose of sending you marketing updates and promotional offers (PDPA Compliant).
                        </span>
                    </label>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <Button type="submit" fullWidth disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
