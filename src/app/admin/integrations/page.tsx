
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function IntegrationsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('overview');
    const [keys, setKeys] = useState<any[]>([]);
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [posTerminals, setPosTerminals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyPermissions, setNewKeyPermissions] = useState('');
    const [waiver, setWaiver] = useState(false);

    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvents, setNewWebhookEvents] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'keys') {
                const res = await fetch('/api/admin/integrations/keys');
                const data = await res.json();
                if (Array.isArray(data)) setKeys(data);
            } else if (activeTab === 'webhooks') {
                const res = await fetch('/api/admin/integrations/webhooks');
                const data = await res.json();
                if (Array.isArray(data)) setWebhooks(data);
            } else if (activeTab === 'logs') {
                const res = await fetch('/api/admin/integrations/logs');
                const data = await res.json();
                if (Array.isArray(data)) setLogs(data);
            } else if (activeTab === 'pos') {
                const res = await fetch('/api/admin/integrations/pos');
                const data = await res.json();
                if (Array.isArray(data)) setPosTerminals(data);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const createKey = async () => {
        if (!newKeyName) return;
        const res = await fetch('/api/admin/integrations/keys', {
            method: 'POST',
            body: JSON.stringify({ name: newKeyName, permissions: newKeyPermissions, rateLimitWaiver: waiver }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            setNewKeyName('');
            setNewKeyPermissions('');
            setWaiver(false);
            fetchData();
        }
    };

    const createWebhook = async () => {
        if (!newWebhookUrl) return;
        const res = await fetch('/api/admin/integrations/webhooks', {
            method: 'POST',
            body: JSON.stringify({ url: newWebhookUrl, events: newWebhookEvents }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            setNewWebhookUrl('');
            setNewWebhookEvents('');
            fetchData();
        }
    };

    const deleteWebhook = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/admin/integrations/webhooks?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Integrations & API 🔌
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200">
                {['overview', 'keys', 'webhooks', 'pos', 'logs'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === tab
                                ? 'border-b-2 border-indigo-600 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium">API Health</h3>
                                    <p className="text-2xl font-bold text-green-600 mt-2">99.9%</p>
                                    <p className="text-xs text-gray-400 mt-1">Uptime last 30 days</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium">Active Webhooks</h3>
                                    <p className="text-2xl font-bold text-indigo-600 mt-2">3</p>
                                    <p className="text-xs text-gray-400 mt-1">Events fired today: 1.2k</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium">POS Terminals</h3>
                                    <p className="text-2xl font-bold text-orange-600 mt-2">12/15</p>
                                    <p className="text-xs text-gray-400 mt-1">Online now</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'keys' && (
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold mb-4">Generate New API Key</h3>
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={newKeyName}
                                                onChange={(e) => setNewKeyName(e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                placeholder="e.g. Mobile App v2"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                                            <input
                                                type="text"
                                                value={newKeyPermissions}
                                                onChange={(e) => setNewKeyPermissions(e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                placeholder="READ_ONLY, POS_SYNC"
                                            />
                                        </div>
                                        <div className="pb-3 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={waiver}
                                                onChange={(e) => setWaiver(e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 rounded"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">Rate Limit Waiver</label>
                                        </div>
                                        <button
                                            onClick={createKey}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Prefix</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waiver</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {keys.map((k) => (
                                                <tr key={k.id}>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{k.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{k.key.substring(0, 8)}...</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{k.permissions || 'ALL'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {k.rateLimitWaiver ? (
                                                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">Active</span>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">None</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'webhooks' && (
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold mb-4">Add Webhook Endpoint</h3>
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-[2]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Payload URL</label>
                                            <input
                                                type="text"
                                                value={newWebhookUrl}
                                                onChange={(e) => setNewWebhookUrl(e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                placeholder="https://api.myapp.com/webhooks/loyalty"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
                                            <input
                                                type="text"
                                                value={newWebhookEvents}
                                                onChange={(e) => setNewWebhookEvents(e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                placeholder="points.earned, user.signup"
                                            />
                                        </div>
                                        <button
                                            onClick={createWebhook}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Secret</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {webhooks.map((w) => (
                                                <tr key={w.id}>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{w.url}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{w.secret ? w.secret.substring(0, 10) + '...' : '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {w.events.split(',').map((e: string) => (
                                                                <span key={e} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{e.trim()}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right">
                                                        <button onClick={() => deleteWebhook(w.id)} className="text-red-600 hover:text-red-900 text-xs font-medium">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pos' && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terminal ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {posTerminals.length === 0 ? (
                                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No POS terminals connected yet.</td></tr>
                                        ) : (
                                            posTerminals.map((t) => (
                                                <tr key={t.id}>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.terminalId}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{t.store?.name}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${t.status === 'ONLINE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {t.lastSyncAt ? new Date(t.lastSyncAt).toLocaleString() : 'Never'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Used</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {logs.length === 0 ? (
                                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent logs.</td></tr>
                                        ) : (
                                            logs.map((log) => (
                                                <tr key={log.id}>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{log.method}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.endpoint}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-2 py-1 rounded text-xs ${log.status >= 500 ? 'bg-red-100 text-red-800' : log.status >= 400 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{log.apiKey?.name || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
