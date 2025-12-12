import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import PromotionList from './PromotionList';

export default async function PromotionsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        redirect('/auth/signin');
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Offers & Promotions</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Exclusive deals curated just for you.</p>
            <PromotionList />
        </div>
    );
}
