'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface Store {
    id: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    phone: string | null;
    email: string | null;
    openingHours: string | null;
    imageUrl: string | null;
}

export default function StoreLocatorPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [sortedStores, setSortedStores] = useState<Store[]>([]);

    useEffect(() => {
        fetch('/api/stores')
            .then(res => res.json())
            .then(data => {
                setStores(data);
                setSortedStores(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Haversine Formula for distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleFindNearest = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });

                const sorted = [...stores].sort((a, b) => {
                    const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
                    const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
                    return distA - distB;
                });

                setSortedStores(sorted);
                setLoading(false);
            },
            () => {
                alert('Unable to retrieve your location');
                setLoading(false);
            }
        );
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Store Locator</h1>
                <button
                    onClick={handleFindNearest}
                    style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    📍 Find Nearest
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading stores...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {sortedStores.map(store => {
                        const distance = userLocation
                            ? calculateDistance(userLocation.lat, userLocation.lng, store.latitude, store.longitude).toFixed(1)
                            : null;

                        return (
                            <Card key={store.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{
                                    height: '150px',
                                    background: store.imageUrl ? `url(${store.imageUrl}) center/cover` : '#eee',
                                    borderRadius: '8px 8px 0 0',
                                    marginBottom: '1rem'
                                }} />

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{store.name}</h3>
                                        {distance && (
                                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {distance} km
                                            </span>
                                        )}
                                    </div>

                                    <p style={{ color: '#666', marginBottom: '0.25rem' }}>{store.address}</p>
                                    <p style={{ color: '#666', marginBottom: '1rem' }}>{store.city}, {store.postalCode}</p>

                                    {store.openingHours && (
                                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            <strong>🕒 Hours:</strong> {store.openingHours}
                                        </p>
                                    )}
                                    {store.phone && (
                                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            <strong>📞 Phone:</strong> {store.phone}
                                        </p>
                                    )}
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${store.address}, ${store.city}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'block',
                                            textAlign: 'center',
                                            background: '#f3f4f6',
                                            color: '#374151',
                                            padding: '0.5rem',
                                            borderRadius: '0.375rem',
                                            textDecoration: 'none',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Get Directions ↗
                                    </a>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
