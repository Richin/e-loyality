'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AdminCommunicationsPage() {
    const [activeTab, setActiveTab] = useState('templates');
    const [templates, setTemplates] = useState([]);
    const [logs, setLogs] = useState([]);
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Template Form
    const [showTemplateForm, setShowTemplateForm] = useState(false);

    useEffect(() => {
        if (activeTab === 'templates') fetchTemplates();
        if (activeTab === 'logs') fetchLogs();
        if (activeTab === 'gateway') fetchSettings();
    }, [activeTab]);

    const fetchTemplates = async () => {
        const res = await fetch('/api/admin/communications/templates');
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
    };

    const fetchLogs = async () => {
        const res = await fetch('/api/admin/communications/logs');
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
    };

    const fetchSettings = async () => {
        const res = await fetch('/api/admin/communications/settings');
        setSettings(await res.json());
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm('Delete this template?')) return;
        await fetch(`/api/admin/communications/templates?id=${id}`, { method: 'DELETE' });
        fetchTemplates();
    };

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Communications & Messaging</h1>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                {['templates', 'gateway', 'logs'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                        color: activeTab === tab ? '#2563eb' : '#64748b', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer'
                    }}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* TAB: TEMPLATES */}
            {activeTab === 'templates' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Message Templates</h2>
                        <Button onClick={() => setShowTemplateForm(true)}>+ New Template</Button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {templates.map((t: any) => (
                            <Card key={t.id} title={t.name}>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Type: <b>{t.type}</b></div>
                                {t.subject && <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>{t.subject}</div>}
                                <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', maxHeight: '100px', overflow: 'hidden' }}>
                                    {t.content}
                                </div>
                                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => deleteTemplate(t.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {showTemplateForm && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
                                <h2>Create Template</h2>
                                <form onSubmit={(e: any) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    fetch('/api/admin/communications/templates', {
                                        method: 'POST',
                                        body: JSON.stringify(Object.fromEntries(formData)),
                                    }).then(() => { setShowTemplateForm(false); fetchTemplates(); });
                                }}>
                                    <input name="name" placeholder="Template Name" required style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                                    <select name="type" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }}>
                                        <option value="EMAIL">Email</option>
                                        <option value="SMS">SMS</option>
                                    </select>
                                    <input name="subject" placeholder="Subject (Email only)" style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />
                                    <textarea name="content" placeholder="Message Content (Use {{name}} for variables)" required rows={5} style={{ display: 'block', width: '100%', margin: '1rem 0', padding: '0.5rem' }} />

                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <Button type="button" onClick={() => setShowTemplateForm(false)} style={{ background: '#94a3b8' }}>Cancel</Button>
                                        <Button type="submit">Create</Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: GATEWAY */}
            {activeTab === 'gateway' && (
                <div style={{ maxWidth: '600px' }}>
                    <Card title="Gateway Configuration">
                        <form onSubmit={(e: any) => {
                            e.preventDefault();
                            setLoading(true);
                            const formData = new FormData(e.target);
                            fetch('/api/admin/communications/settings', {
                                method: 'POST',
                                body: JSON.stringify(Object.fromEntries(formData)),
                            }).then(() => { setLoading(false); alert('Settings Saved'); });
                        }}>
                            <h3 style={{ marginTop: '1rem', fontWeight: 'bold' }}>Email Provider</h3>
                            <select name="email_provider" defaultValue={settings.emailProvider} style={{ display: 'block', width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}>
                                <option value="SMTP">SMTP</option>
                                <option value="SENDGRID">SendGrid</option>
                                <option value="AWS">AWS SES</option>
                            </select>
                            <input name="email_api_key" placeholder="API Key" defaultValue={settings.emailApiKey} type="password" style={{ display: 'block', width: '100%', padding: '0.5rem', margin: '0.5rem 0' }} />

                            <h3 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>SMS Provider</h3>
                            <select name="sms_provider" defaultValue={settings.smsProvider} style={{ display: 'block', width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}>
                                <option value="TWILIO">Twilio</option>
                                <option value="MSG91">MSG91</option>
                            </select>
                            <input name="sms_sid" placeholder="Account SID" defaultValue={settings.smsSid} style={{ display: 'block', width: '100%', padding: '0.5rem', margin: '0.5rem 0' }} />
                            <input name="sms_auth_token" placeholder="Auth Token" defaultValue={settings.smsAuthToken} type="password" style={{ display: 'block', width: '100%', padding: '0.5rem', margin: '0.5rem 0' }} />

                            <div style={{ marginTop: '1rem' }}>
                                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Configuration'}</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* TAB: LOGS */}
            {activeTab === 'logs' && (
                <div>
                    <Card title="Message Logs">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '0.5rem' }}>Time</th>
                                    <th style={{ padding: '0.5rem' }}>Recipient</th>
                                    <th style={{ padding: '0.5rem' }}>Channel</th>
                                    <th style={{ padding: '0.5rem' }}>Campaign</th>
                                    <th style={{ padding: '0.5rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log: any) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.5rem' }}>{new Date(log.sentAt).toLocaleString()}</td>
                                        <td style={{ padding: '0.5rem' }}>{log.recipientContact}</td>
                                        <td style={{ padding: '0.5rem' }}>{log.channel}</td>
                                        <td style={{ padding: '0.5rem' }}>{log.campaign?.name || '-'}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <span style={{
                                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                                background: log.status === 'SENT' ? '#dcfce7' : log.status === 'FAILED' ? '#fee2e2' : '#f3f4f6',
                                                color: log.status === 'SENT' ? '#166534' : log.status === 'FAILED' ? '#b91c1c' : '#374151'
                                            }}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}
        </div>
    );
}
