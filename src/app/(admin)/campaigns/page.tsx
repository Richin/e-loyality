import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import prisma from '@/lib/prisma';
import CampaignList from './CampaignList';
import styles from './campaigns.module.css';

async function getCampaigns() {
    return await prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export default async function CampaignsPage() {
    // Note: In real app, add check for ADMIN role here
    const campaigns = await getCampaigns();

    // Serialize dates for client component
    const serializedCampaigns = campaigns.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        sentAt: c.sentAt ? c.sentAt.toISOString() : null,
    }));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Marketing Campaigns</h1>
                <Link href="/campaigns/new">
                    <Button>Create New Campaign</Button>
                </Link>
            </div>

            <CampaignList initialCampaigns={serializedCampaigns} />
        </div>
    );
}
