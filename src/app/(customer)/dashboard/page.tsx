
import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardView from '@/components/customer/DashboardView';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    let user = null;
    if (session.user.email) {
        user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberProfile: {
                    include: { tier: true }
                }
            }
        });
    }

    if (!user) {
        return <Typography>User not found. Please contact support.</Typography>;
    }

    const profile = user.memberProfile;

    if (!profile) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h4">Welcome, {user.name}</Typography>
                <Typography>Your member profile is being set up. Please refresh in a moment.</Typography>
            </Box>
        )
    }

    // Transform user data to plain objects to avoid serialization issues with Dates if any (Prisma dates are fine normally but good practice)
    const userProp = {
        name: user.name,
        email: user.email,
        role: user.role?.name || 'USER', // Assuming role is relation now, handle safely
    };

    // We need to fetch role name if it's not included above. 
    // Wait, in previous schema check, user.role is a relation.
    // user.roleId is on user. 
    // I should include role in the query above to be safe.

    const userWithRole = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
            role: true,
            memberProfile: {
                include: { tier: true }
            }
        }
    });

    if (!userWithRole || !userWithRole.memberProfile) return <div>Error loading profile</div>;

    const safeUser = {
        name: userWithRole.name,
        email: userWithRole.email,
        role: userWithRole.role?.name || 'USER'
    };

    return <DashboardView user={safeUser} profile={userWithRole.memberProfile} />;
}
