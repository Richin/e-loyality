'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function MarketingDashboard() {
    const [running, setRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [lastRun, setLastRun] = useState<string | null>(null);

    const runAutomations = async () => {
        setRunning(true);
        setLogs([]);
        try {
            const res = await fetch('/api/automations/run', { method: 'POST' });
            const data = await res.json();
            if (data.logs) setLogs(data.logs);
            setLastRun(new Date().toLocaleString());
        } catch (e) {
            alert('Error running automations');
        } finally {
            setRunning(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Marketing Automation</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <Card title="Tools">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link href="/admin/segments">
                            <Button variant="outline" fullWidth>Manage Audience Segments</Button>
                        </Link>
                        <Link href="/campaigns/new">
                            <Button variant="outline" fullWidth>Create Scheduled Campaign</Button>
                        </Link>
                    </div>
                </Card>

                <Card title="Automation Engine">
                    <p style={{ color: '#666', marginBottom: '1rem' }}>
                        Manually trigger the automation engine to check for scheduled campaigns, birthdays, and inactive users.
                    </p>
                    <Button onClick={runAutomations} disabled={running} fullWidth>
                        {running ? 'Running...' : 'Run Automations Now'}
                    </Button>
                    {lastRun && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#999' }}>Last run: {lastRun}</p>}
                </Card>
            </div>

            {logs.length > 0 && (
                <div style={{ background: '#1e1e1e', color: '#0f0', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Execution Logs</h4>
                    {logs.map((l, i) => (
                        <div key={i}>&gt; {l}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
