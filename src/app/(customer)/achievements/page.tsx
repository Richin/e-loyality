import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Card } from '@/components/ui/Card';

export default async function AchievementsPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return redirect('/auth/signin');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberProfile: {
                include: {
                    userBadges: { include: { badge: true } },
                    userChallenges: { include: { challenge: true } }
                }
            }
        }
    });

    if (!user || !user.memberProfile) return <div>Profile not found</div>;

    const profile = user.memberProfile;

    // Fetch all available badges to show unearned ones
    const allBadges = await prisma.badge.findMany();
    const earnedBadgeIds = new Set(profile.userBadges.map(ub => ub.badgeId));

    // Fetch all active challenges
    const allChallenges = await prisma.challenge.findMany({
        where: {
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
            ]
        }
    });

    // Leaderboard (Top 10)
    const leaderboard = await prisma.memberProfile.findMany({
        take: 10,
        orderBy: { pointsBalance: 'desc' },
        include: { user: { select: { name: true, image: true } } }
    });

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Achievements & Rewards</h1>

            {/* Streak & Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', margin: '0 0 0.5rem 0' }}>🔥</div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{profile.currentStreak || 0}</h2>
                        <p style={{ opacity: 0.9 }}>Day Streak</p>
                    </div>
                </Card>
                <Card>
                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', margin: '0 0 0.5rem 0' }}>🏆</div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{profile.pointsBalance.toLocaleString()}</h2>
                        <p style={{ color: '#666' }}>Total Points</p>
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Badges Section */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Badges</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                        {allBadges.map(badge => {
                            const isEarned = earnedBadgeIds.has(badge.id);
                            return (
                                <Card key={badge.id} style={{
                                    padding: '1rem',
                                    textAlign: 'center',
                                    opacity: isEarned ? 1 : 0.5,
                                    background: isEarned ? '#fff' : '#f9f9f9',
                                    filter: isEarned ? 'none' : 'grayscale(100%)'
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{badge.icon || '🏅'}</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{badge.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{badge.description}</div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Challenges Section */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Monthly Challenges</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {allChallenges.map(chal => {
                            // Find user progress
                            const userChal = profile.userChallenges.find(uc => uc.challengeId === chal.id);
                            const progress = userChal ? userChal.progress : 0;
                            const percent = Math.min(100, Math.round((progress / chal.goal) * 100));

                            return (
                                <Card key={chal.id} style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{chal.title}</div>
                                        <div style={{ color: '#27ae60', fontWeight: 'bold' }}>+{chal.pointsReward} pts</div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>{chal.description}</p>

                                    {/* Progress Bar */}
                                    <div style={{ background: '#eee', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            background: percent === 100 ? '#27ae60' : '#3498db',
                                            width: `${percent}%`,
                                            height: '100%'
                                        }}></div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                        {progress} / {chal.goal} ({percent}%)
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Leaderboard</h2>
                <Card>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', width: '60px' }}>Rank</th>
                                <th style={{ padding: '1rem' }}>Member</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((member, idx) => (
                                <tr key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold', color: idx < 3 ? '#e67e22' : '#666' }}>
                                        #{idx + 1}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {member.user.name || 'Anonymous User'}
                                        {member.user.name === user.name && <span style={{ marginLeft: '8px', background: '#e8f5e9', color: '#27ae60', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>(You)</span>}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                                        {member.pointsBalance.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
}
