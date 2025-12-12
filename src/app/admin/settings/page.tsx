
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({});
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        fetchSettings();
        fetchTemplates();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/configuration/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/communications/templates');
            const data = await res.json();
            if (Array.isArray(data)) setTemplates(data);
        } catch (error) {
            console.error('Failed to fetch templates');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setSettings((prev: any) => ({ ...prev, [name]: String(checked) }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/configuration/settings', {
                method: 'POST',
                body: JSON.stringify(settings),
                headers: { 'Content-Type': 'application/json' }
            });
            alert('Settings Saved!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    Global Settings ⚙️
                </h1>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center shadow-lg"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200">
                {['general', 'branding', 'legal', 'tax', 'notifications'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors capitalize ${activeTab === tab
                                ? 'border-b-2 border-indigo-600 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">

                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
                                <input
                                    name="app_name"
                                    value={settings.app_name || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="My Loyalty App"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                                    <select
                                        name="language"
                                        value={settings.language || 'en'}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    >
                                        <option value="en">English (US)</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                    <select
                                        name="timezone"
                                        value={settings.timezone || 'UTC'}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">EST (New York)</option>
                                        <option value="Europe/London">GMT (London)</option>
                                        <option value="Asia/Tokyo">JST (Tokyo)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                                <input
                                    name="currency_symbol"
                                    value={settings.currency_symbol || '$'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="$"
                                />
                            </div>
                        </div>
                    )}

                    {/* Branding Settings */}
                    {activeTab === 'branding' && (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                <input
                                    name="brand_logo"
                                    value={settings.brand_logo || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="https://example.com/logo.png"
                                />
                                {settings.brand_logo && (
                                    <img src={settings.brand_logo} alt="Logo Preview" className="h-16 mt-4 object-contain border rounded p-2" />
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            name="brand_primary_color"
                                            value={settings.brand_primary_color || '#4F46E5'}
                                            onChange={handleChange}
                                            className="h-10 w-10 border rounded cursor-pointer"
                                        />
                                        <input
                                            name="brand_primary_color"
                                            value={settings.brand_primary_color || '#4F46E5'}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border rounded-lg uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legal Settings */}
                    {activeTab === 'legal' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                                <textarea
                                    name="terms_content"
                                    value={settings.terms_content || ''}
                                    onChange={handleChange}
                                    rows={10}
                                    className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                                    placeholder="Enter full terms here..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy</label>
                                <textarea
                                    name="privacy_content"
                                    value={settings.privacy_content || ''}
                                    onChange={handleChange}
                                    rows={10}
                                    className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                                    placeholder="Enter privacy policy here..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Tax Settings */}
                    {activeTab === 'tax' && (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
                                <input
                                    type="number"
                                    name="tax_rate"
                                    value={settings.tax_rate || '0'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="tax_inclusive"
                                    checked={settings.tax_inclusive === 'true'}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-indigo-600 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">Prices include tax</label>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6 max-w-lg">
                            <h3 className="text-md font-semibold text-gray-800">System Templates</h3>
                            <p className="text-sm text-gray-500 mb-4">Select which template to send for system events.</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Email</label>
                                <select
                                    name="template_welcome"
                                    value={settings.template_welcome || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password Reset</label>
                                <select
                                    name="template_reset_password"
                                    value={settings.template_reset_password || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Confirmation</label>
                                <select
                                    name="template_order_confirm"
                                    value={settings.template_order_confirm || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
