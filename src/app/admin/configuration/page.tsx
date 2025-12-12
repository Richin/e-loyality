'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ConfigurationPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState<any>({});
    const [tiers, setTiers] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [showTierForm, setShowTierForm] = useState(false);
    const [editingTier, setEditingTier] = useState<any>(null);
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [editingRule, setEditingRule] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, tRes, rRes] = await Promise.all([
                fetch('/api/admin/configuration/settings'),
                fetch('/api/admin/configuration/tiers'),
                fetch('/api/admin/configuration/rules')
            ]);
            setSettings(await sRes.json());
            setTiers(await tRes.json());
            setRules(await rRes.json());
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveSettings = async (e: any) => {
        e.preventDefault();
        setIsSaving(true);
        const form = new FormData(e.target);
        const data: any = {};
        form.forEach((value, key) => data[key] = value);

        await fetch('/api/admin/configuration/settings', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        setIsSaving(false);
        alert('Settings Saved');
    };

    const saveTier = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data: any = {};
        form.forEach((value, key) => data[key] = value);
        if (editingTier?.id) data.id = editingTier.id;

        await fetch('/api/admin/configuration/tiers', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        setShowTierForm(false);
        setEditingTier(null);
        fetchData();
    };

    const deleteTier = async (id: string) => {
        if (!confirm('Delete this tier?')) return;
        await fetch(`/api/admin/configuration/tiers?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const saveRule = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data: any = {};
        form.forEach((value, key) => data[key] = value);
        if (editingRule?.id) data.id = editingRule.id;

        await fetch('/api/admin/configuration/rules', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        setShowRuleForm(false);
        setEditingRule(null);
        fetchData();
    };

    const deleteRule = async (id: string) => {
        if (!confirm('Delete this rule?')) return;
        await fetch(`/api/admin/configuration/rules?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Configuration...</div>;

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Loyalty Program Configuration</h1>

            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                {['general', 'tiers', 'rules'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                        color: activeTab === tab ? '#2563eb' : '#64748b', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer'
                    }}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'general' && (
                <Card title="Global Program Settings">
                    <form onSubmit={saveSettings} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Currency Symbol</label>
                            <input name="currency_symbol" defaultValue={settings.currency_symbol || '$'} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Base Earn Rate (Points per $1)</label>
                            <input name="earn_rate" type="number" step="0.1" defaultValue={settings.earn_rate || '1.0'} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Expiry Policy</label>
                            <select name="expiry_type" defaultValue={settings.expiry_type || 'ROLLING'} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                                <option value="ROLLING">Rolling (extends on activity)</option>
                                <option value="FIXED">Fixed (from earn date)</option>
                                <option value="NONE">No Expiry</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Expiry Duration (Days)</label>
                            <input name="expiry_days" type="number" defaultValue={settings.expiry_days || '365'} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</Button>
                        </div>
                    </form>
                </Card>
            )}

            {activeTab === 'tiers' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <Button onClick={() => { setEditingTier(null); setShowTierForm(true); }}>+ Add New Tier</Button>
                    </div>

                    {showTierForm && (
                        <Card title={editingTier ? 'Edit Tier' : 'New Tier'} style={{ marginBottom: '2rem', border: '1px solid #2563eb' }}>
                            <form onSubmit={saveTier}>
                                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                                    <div>
                                        <label style={{ display: 'block' }}>Tier Name</label>
                                        <input name="name" defaultValue={editingTier?.name} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block' }}>Threshold (Points)</label>
                                        <input name="threshold" type="number" defaultValue={editingTier?.threshold} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block' }}>Benefits Description</label>
                                        <textarea name="benefits" defaultValue={editingTier?.benefits} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} rows={3} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                                        <Button type="submit">Save Tier</Button>
                                        <button type="button" onClick={() => setShowTierForm(false)} style={{ padding: '0.5rem 1rem', border: 'none', background: '#ccc', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
                                    </div>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {tiers.map((tier: any) => (
                            <Card key={tier.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{tier.name}</h3>
                                        <div style={{ color: '#666' }}>threshold: {tier.threshold} points</div>
                                        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{tier.benefits}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button size="sm" onClick={() => { setEditingTier(tier); setShowTierForm(true); }}>Edit</Button>
                                        <Button size="sm" style={{ background: '#dc2626' }} onClick={() => deleteTier(tier.id)}>Delete</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'rules' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <Button onClick={() => { setEditingRule(null); setShowRuleForm(true); }}>+ Add New Rule</Button>
                    </div>

                    {showRuleForm && (
                        <Card title={editingRule ? 'Edit Rule' : 'New Rule'} style={{ marginBottom: '2rem', border: '1px solid #2563eb' }}>
                            <form onSubmit={saveRule}>
                                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                                    <div>
                                        <label style={{ display: 'block' }}>Rule Name</label>
                                        <input name="name" defaultValue={editingRule?.name} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block' }}>Type</label>
                                        <select name="type" defaultValue={editingRule?.type || 'SPEND'} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }}>
                                            <option value="SPEND">Spend (Multiplier)</option>
                                            <option value="VISIT">Visit (Fixed Points)</option>
                                            <option value="BIRTHDAY">Birthday Bonus</option>
                                            <option value="ANNIVERSARY">Anniversary Bonus</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block' }}>Multiplier (e.g. 1.5x)</label>
                                        <input name="multiplier" type="number" step="0.1" defaultValue={editingRule?.multiplier || 1.0} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block' }}>Bonus Points (Flat)</label>
                                        <input name="bonusPoints" type="number" defaultValue={editingRule?.bonusPoints || 0} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block' }}>Min Spend (Optional)</label>
                                        <input name="minSpend" type="number" defaultValue={editingRule?.minSpend} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block' }}>Status</label>
                                        <select name="isActive" defaultValue={editingRule?.isActive?.toString()} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd' }}>
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <Button type="submit">Save Rule</Button>
                                        <button type="button" onClick={() => setShowRuleForm(false)} style={{ padding: '0.5rem 1rem', border: 'none', background: '#ccc', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
                                    </div>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {rules.map((rule: any) => (
                            <Card key={rule.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{rule.name}</h3>
                                            <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{rule.type}</span>
                                            {!rule.isActive && <span style={{ fontSize: '0.8rem', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>INACTIVE</span>}
                                        </div>
                                        <div style={{ color: '#666', marginTop: '0.25rem' }}>
                                            {rule.type === 'SPEND' && `Earn ${rule.multiplier}x points per $1`}
                                            {(rule.type !== 'SPEND') && `Award ${rule.bonusPoints} points`}
                                            {rule.minSpend > 0 && ` (Min Spend: $${rule.minSpend})`}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button size="sm" onClick={() => { setEditingRule(rule); setShowRuleForm(true); }}>Edit</Button>
                                        <Button size="sm" style={{ background: '#dc2626' }} onClick={() => deleteRule(rule.id)}>Delete</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
