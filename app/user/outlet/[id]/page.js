"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Clock, MapPin, Search, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OutletMenu() {
    const params = useParams();
    const router = useRouter();
    const outletId = params?.id || 'demo';

    const [activeCategory, setActiveCategory] = useState("Recommended");
    const [cart, setCart] = useState({}); // { itemId: qty }
    const [items, setItems] = useState([]);
    const [outlet, setOutlet] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Rating State
    const [showRating, setShowRating] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');

    const avgRating = outlet?.ratings?.length > 0
        ? (outlet.ratings.reduce((a, b) => a + b.rating, 0) / outlet.ratings.length).toFixed(1)
        : 'New';

    const submitRating = async () => {
        if (userRating === 0) return alert("Please select a star rating");
        try {
            const res = await fetch('/api/rating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outletId, rating: userRating, comment: ratingComment })
            });
            if (res.ok) {
                alert("Rating submitted! Thank you.");
                setShowRating(false);
                // Refresh outlet to see new rating
                fetch(`/api/outlets?id=${outletId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.length > 0) setOutlet(data[0]);
                    });
            } else {
                alert("Failed to submit rating");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Fetch Menu and Outlet Details
    useEffect(() => {
        if (!outletId) return;

        // Fetch Menu
        fetch(`/api/menu?outletId=${outletId}`)
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error('Failed to fetch menu', err));

        // Fetch Outlet Details
        fetch(`/api/outlets?id=${outletId}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) setOutlet(data[0]);
            })
            .catch(err => console.error('Failed to fetch outlet', err));

    }, [outletId]);

    const categories = ["Recommended", "Main Course", "Chinese", "Beverages", "Desserts"];

    // Cart Logic
    const updateQty = (id, delta) => {
        setCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    const cartTotalQty = Object.values(cart).reduce((a, b) => a + b, 0);
    const cartTotalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
        const item = items.find(i => i.id == id);
        return total + (item ? item.price * qty : 0);
    }, 0);

    const proceedToCart = () => {
        // Save cart to local storage for checkout page
        const cartItems = Object.entries(cart).map(([id, qty]) => {
            const item = items.find(i => i.id == id);
            return { ...item, qty };
        });
        localStorage.setItem('user_cart', JSON.stringify({ outletId, items: cartItems, total: cartTotalPrice }));
        router.push('/user/checkout');
    };

    return (
        <main className="container flex-col fade-in" style={{ paddingBottom: '90px' }}>

            {/* Top / Nav */}
            <div
                className="p-4"
                style={{
                    position: 'absolute', top: 0, left: 0, zIndex: 10
                }}
            >
                <Link href="/user">
                    <div style={{ background: 'white', padding: '8px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <ArrowLeft size={20} color="black" />
                    </div>
                </Link>
            </div>

            {/* Hero Header */}
            <div style={{ height: '200px', background: 'url(https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80) center/cover', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '20px', color: 'white' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{outlet?.shopName || 'Loading...'}</h1>
                    <div className="flex-center gap-2" style={{ justifyContent: 'flex-start', fontSize: '0.85rem', opacity: 0.9 }}>
                        <span className="flex-center gap-1" style={{ background: 'white', color: 'black', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            <Star size={12} fill={avgRating === 'New' ? 'none' : 'orange'} stroke="orange" />
                            {avgRating}
                        </span>
                        <span>•</span>
                        <button onClick={() => setShowRating(true)} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            Rate Us
                        </button>
                    </div>
                    {outlet?.description && (
                        <p style={{ marginTop: '8px', fontSize: '0.9rem', opacity: 0.8, maxWidth: '600px' }}>
                            {outlet.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Menu Categories (Sticky) */}
            <div className="p-4" style={{ position: 'sticky', top: 0, background: 'var(--background)', zIndex: 5, overflowX: 'auto', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                background: activeCategory === cat ? 'var(--primary)' : 'white',
                                color: activeCategory === cat ? 'white' : 'var(--text-main)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                boxShadow: activeCategory === cat ? 'var(--shadow-md)' : 'none'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div style={{ padding: '1rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
                <div className="flex-center" style={{ background: 'white', padding: '14px 16px', borderRadius: '12px', border: '2px solid var(--border)', gap: '12px' }}>
                    <Search size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <input
                        placeholder="Search in menu..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 500 }}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-col gap-4 p-4 pt-0">
                {items
                    .filter(i => (activeCategory === 'Recommended' || i.category === activeCategory) && 
                                (searchQuery === '' || i.name.toLowerCase().includes(searchQuery.toLowerCase())))
                    .map(item => (
                    <div key={item.id} className="flex-center" style={{ justifyContent: 'space-between', background: 'white', padding: '12px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', gap: '12px' }}>

                        {/* Image on Left */}
                        <div style={{ flexShrink: 0 }}>
                            {item.image ? (
                                <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                            ) : (
                                <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1 }}>
                            <div style={{ width: '16px', height: '16px', border: `1px solid ${item.isVeg ? 'green' : 'red'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.isVeg ? 'green' : 'red' }}></div>
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{item.name}</h3>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>₹{item.price}</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{item.description || item.desc || 'Delicious and freshly prepared.'}</p>
                        </div>

                        {/* Add Button */}
                        <div className="flex-col flex-center" style={{ flexShrink: 0 }}>
                            {cart[item.id] ? (
                                <div className="flex-center" style={{ background: 'white', border: '1px solid var(--accent)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                    <button onClick={() => updateQty(item.id, -1)} style={{ padding: '6px 8px', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}><Minus size={14} /></button>
                                    <span style={{ padding: '0 4px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>{cart[item.id]}</span>
                                    <button onClick={() => updateQty(item.id, 1)} style={{ padding: '6px 8px', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}><Plus size={14} /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => updateQty(item.id, 1)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        background: 'white',
                                        color: 'var(--accent)',
                                        fontWeight: 700,
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        boxShadow: 'var(--shadow-sm)',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    ADD
                                </button>
                            )}
                        </div>

                    </div>
                ))}
                {items.length === 0 && (
                    <div className="flex-col flex-center" style={{ minHeight: '200px', color: 'var(--text-muted)' }}>
                        <Clock size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No items available</h3>
                        <p>Menu is being updated.</p>
                    </div>
                )}
                <div style={{ height: '40px' }}></div>
            </div>

            {/* Sticky Cart Bar */}
            {cartTotalQty > 0 && items.length > 0 && (
                <div
                    onClick={proceedToCart}
                    className="fade-in"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: '450px',
                        background: 'var(--accent)',
                        color: 'white',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
                        zIndex: 50,
                        cursor: 'pointer'
                    }}
                >
                    <div className="flex-col">
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9 }}>{cartTotalQty} ITEMS</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{cartTotalPrice} <span style={{ opacity: 0.7, fontSize: '0.8rem', fontWeight: 500 }}>plus taxes</span></span>
                    </div>
                    <div className="flex-center gap-2" style={{ fontWeight: 700 }}>
                        View Cart <ShoppingBag size={18} />
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRating && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowRating(false)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '300px' }}>
                        <h3 style={{ marginBottom: '10px' }}>Rate {outlet?.shopName}</h3>
                        <div className="flex-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    size={24}
                                    fill={userRating >= star ? "orange" : "none"}
                                    stroke="orange"
                                    onClick={() => setUserRating(star)}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </div>
                        <input
                            placeholder="Write a review..."
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '10px' }}
                            value={ratingComment}
                            onChange={e => setRatingComment(e.target.value)}
                        />
                        <button
                            onClick={submitRating}
                            style={{ width: '100%', background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 600 }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}

        </main>
    );
}
