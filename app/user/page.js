"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ScanLine, MapPin, Star, ArrowRight, User } from 'lucide-react';

import { useSession } from 'next-auth/react';

export default function UserHome() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [recommendations, setRecommendations] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [location, setLocation] = React.useState({ address: 'Fetching location...', coords: null });
    const [profileImage, setProfileImage] = React.useState(null);

    // Check if user is logged in (Local Token OR Google Session)
    useEffect(() => {
        // Wait for session to load
        if (status === 'loading') return;

        const token = localStorage.getItem('user_token');

        // If Google Session exists but no local token, verify/set it
        if (session?.user && !token) {
            localStorage.setItem('user_token', 'google_session_active');
            localStorage.setItem('user_email', session.user.email);
            localStorage.setItem('user_name', session.user.name);
        }

        // If neither exists, redirect to login
        if (!token && !session) {
            router.push('/user/login');
        }
    }, [router, session, status]);

    // Fetch user's location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Try to get address from coordinates using reverse geocoding
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        const address = data.display_name?.split(',').slice(0, 3).join(',') || 'Your Location';
                        setLocation({ address, coords: { latitude, longitude } });
                    } catch (err) {
                        setLocation({ address: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`, coords: { latitude, longitude } });
                    }
                },
                (error) => {
                    let errorMessage = 'Location unavailable';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location signal not found';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                        default:
                            errorMessage = 'Location error';
                    }
                    console.warn('Geolocation warning:', errorMessage); // Changed from error to warn to avoid panic
                    setLocation({ address: errorMessage, coords: null });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setLocation({ address: 'Location not supported', coords: null });
        }
    }, []);

    // Fetch real outlets
    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const res = await fetch('/api/outlets');
                const outlets = await res.json();
                setRecommendations(outlets);
            } catch (err) {
                console.error('Failed to fetch outlets', err);
            }
        };

        fetchOutlets();
    }, []);

    // Load profile image from localStorage
    useEffect(() => {
        const userImage = localStorage.getItem('user_image');
        if (userImage) {
            setProfileImage(userImage);
        }
    }, []);

    // Filter outlets based on search and delivery availability
    const filteredOutlets = recommendations
        .filter(outlet => outlet.delivery === true) // Only show outlets with delivery enabled
        .filter(outlet => 
            searchQuery
                ? outlet.shopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  outlet.type?.toLowerCase().includes(searchQuery.toLowerCase())
                : true
        );

    return (
        <main className="container flex-col p-6 fade-in" style={{ paddingBottom: '80px' }}>

            {/* Header / Location */}
            <header className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div className="flex-col">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DELIVER TO</span>
                    <div className="flex-center gap-1" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        <MapPin size={16} fill="var(--primary)" />
                        <span style={{ fontSize: '0.9rem' }}>{location.address}</span>
                    </div>
                </div>
                <Link href="/user/profile" style={{ textDecoration: 'none' }}>
                    <div style={{ width: '40px', height: '40px', background: profileImage ? 'transparent' : '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '2px solid var(--border)' }}>
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={18} color="var(--text-muted)" />
                        )}
                    </div>
                </Link>
            </header>

            {/* Hero / CTA */}
            <div
                className="flex-col p-6 mb-6"
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                    borderRadius: '24px',
                    color: 'white',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2 }}>Hungry?<br />Scan & Order.</h2>
                    <p style={{ opacity: 0.8, marginBottom: '1.5rem', fontSize: '0.9rem' }}>Skip the queue, dine like a boss.</p>

                    <Link href="/user/scan" style={{ textDecoration: 'none' }}>
                        <button className="flex-center gap-2" style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}>
                            <ScanLine size={20} /> Scan QR Code
                        </button>
                    </Link>
                </div>
                {/* Decorative circle */}
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            </div>

            {/* Search */}
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="flex-center" style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '2px solid var(--border)', gap: '12px' }}>
                    <Search size={24} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <input
                        placeholder="Search restaurant, dish..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}
                    />
                </div>
            </div>

            {/* Recommendations */}
            <section className="flex-col gap-4">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {searchQuery ? `Search Results (${filteredOutlets.length})` : 'All Restaurants'}
                </h3>

                {filteredOutlets.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        {searchQuery ? 'No restaurants found matching your search.' : 'No restaurants available yet.'}
                    </p>
                ) : (
                    filteredOutlets.map(outlet => (
                        <Link key={outlet.id} href={`/user/outlet/${outlet.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="flex-col" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}>
                                <div style={{ height: '140px', background: `linear-gradient(135deg, #0f172a 0%, #334155 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700 }}>
                                    {outlet.shopName?.charAt(0) || '?'}
                                </div>
                                <div className="p-4">
                                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{outlet.shopName || 'Unknown'}</h4>
                                        <div className="flex-center gap-1" style={{ background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            <Star size={10} fill="white" /> {outlet.ratings?.length > 0 ? (outlet.ratings.reduce((a, b) => a + b.rating, 0) / outlet.ratings.length).toFixed(1) : 'New'}
                                        </div>
                                    </div>
                                    <div className="flex-center" style={{ justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        <span>{outlet.type || 'Restaurant'}</span>
                                        <span>{outlet.delivery ? 'Delivery Available' : 'Dine-in Only'}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </section>

        </main>
    );
}
