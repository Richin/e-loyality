'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function ProgramRulesPage() {
    const [config, setConfig] = useState({
        earn_rate: '1',    // Points per $1
        currency_symbol: '$',
        points_expiry_days: '365',
        signup_bonus_points: '50'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/admin/settings/program')
            .then(res => res.json())
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    setConfig(prev => ({ ...prev, ...data }));
                }
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await fetch('/api/admin/settings/program', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        setSaving(false);
        alert('Settings saved!');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Loyalty Program Rules</h1>

            <Card title="Earning & Currency">
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Currency Symbol</label>
                    <Input
                        value={config.currency_symbol}
                        onChange={e => setConfig({ ...config, currency_symbol: e.target.value })}
                    />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Base Earn Rate (Points per {config.currency_symbol}1)</label>
                    <Input
                        type="number" step="0.1"
                        value={config.earn_rate}
                        onChange={e => setConfig({ ...config, earn_rate: e.target.value })}
                    />
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>
                        How many points a customer earns for every dollar spent.
                    </p>
                </div>
            </Card>

            <div style={{ height: '2rem' }}></div>

            <Card title="Lifecycle & Bonuses">
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Points Expiry (Days)</label>
                    <Input
                        type="number"
                        value={config.points_expiry_days}
                        onChange={e => setConfig({ ...config, points_expiry_days: e.target.value })}
                    />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sign-up Bonus (Points)</label>
                    <Input
                        type="number"
                        value={config.signup_bonus_points}
                        onChange={e => setConfig({ ...config, signup_bonus_points: e.target.value })}
                    />
                </div>
            </Card>

            <div style={{ marginTop: '2rem' }}>
                <Button onClick={handleSave} disabled={saving} fullWidth>{saving ? 'Saving...' : 'Save Configuration'}</Button>
            </div>
        </div>
    );
}
