"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Banknote, Truck, Utensils, ShoppingBag, Locate, QrCode as QrIcon, X } from 'lucide-react';
import Link from 'next/link';

export default function Checkout() {
    const router = useRouter();
    const [cart, setCart] = useState(null);
    const [outlet, setOutlet] = useState(null);
    const [mode, setMode] = useState('Dine-in');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    const [details, setDetails] = useState({
        customerName: '',
        tableNo: '',
        address: '',
        phone: '',
        note: ''
    });

    useEffect(() => {
        const stored = localStorage.getItem('user_cart');
        if (stored) {
            const cartData = JSON.parse(stored);
            setCart(cartData);

            fetch(`/api/outlets`)
                .then(res => res.json())
                .then(outlets => {
                    const outletData = outlets.find(o => o.id === cartData.outletId);
                    setOutlet(outletData);

                    if (!outletData?.delivery && mode === 'Delivery') {
                        setMode('Dine-in');
                    }
                })
                .catch(err => console.error('Failed to fetch outlet', err));

            fetch(`/api/menu?outletId=${cartData.outletId}`)
                .then(res => res.json())
                .then(menuItems => {
                    const validItems = cartData.items.filter(cartItem =>
                        menuItems.some(menuItem => menuItem.id === cartItem.id)
                    );

                    if (validItems.length === 0 && cartData.items.length > 0) {
                        alert("Items in your cart are no longer available at this outlet.");
                        localStorage.removeItem('user_cart');
                        router.push(`/user/outlet/${cartData.outletId}`);
                    } else if (validItems.length < cartData.items.length) {
                        alert("Some items in your cart are no longer available and were removed.");
                        const newTotal = validItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
                        const newCart = { ...cartData, items: validItems, total: newTotal };
                        setCart(newCart);
                        localStorage.setItem('user_cart', JSON.stringify(newCart));
                    }
                })
                .catch(err => console.error('Failed to validate menu', err));

        } else {
            router.push('/user');
        }
    }, [router]);

    if (!cart) return <div className="p-6">Loading Cart...</div>;

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                        headers: {
                            'User-Agent': 'ZortaFoodApp/1.0',
                            'Accept-Language': 'en-US,en;q=0.9'
                        }
                    });

                    if (!res.ok) throw new Error("Address API failed");

                    const data = await res.json();
                    if (data.display_name) {
                        setDetails(prev => ({ ...prev, address: data.display_name }));
                    } else {
                        alert("Could not fetch address details");
                    }
                } catch (err) {
                    console.error("Location Error:", err);
                    alert("Location fetch failed. Please type address manually.");
                } finally {
                    setLocating(false);
                }
            },
            (error) => {
                console.error("Geolocation Error:", error);
                let msg = "Unable to retrieve your location.";
                if (error.code === 1) msg = "Location permission denied. Please enable it in browser settings.";
                else if (error.code === 2) msg = "Location unavailable. Check your GPS/Internet.";
                else if (error.code === 3) msg = "Location request timed out.";
                alert(msg);
                setLocating(false);
            }
        );
    };

    const handlePlaceOrder = async () => {
        if (!details.customerName?.trim()) {
            alert("Please enter your name");
            return;
        }

        if (mode === 'Delivery' && !details.address?.trim()) {
            alert("Please enter your Delivery Address");
            return;
        }

        if (!details.phone?.trim()) {
            alert("Please enter your phone number");
            return;
        }

        if (paymentMethod === 'upi') {
            setShowQrModal(true);
            return;
        }

        placeOrderDirect();
    };

    const placeOrderDirect = async (paymentId = null) => {
        setLoading(true);
        const orderData = {
            items: cart.items,
            total: cart.total,
            mode: mode,
            details: details,
            outletId: cart.outletId,
            paymentMethod: paymentMethod,
            paymentId: paymentId || null,
            paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid'
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) {
                const error = await res.json();
                alert(`Failed to place order: ${error.error || 'Unknown error'}`);
                setLoading(false);
                return;
            }

            const newOrder = await res.json();
            
            if (!newOrder.id && !newOrder._id) {
                alert("Order created but ID missing. Please refresh.");
                setLoading(false);
                return;
            }

            localStorage.removeItem('user_cart');
            const orderId = newOrder.id || newOrder._id;
            setTimeout(() => router.push(`/user/track/${orderId}`), 500);
        } catch (err) {
            console.error("Order error:", err);
            alert("Failed to place order. Please try again.");
            setLoading(false);
        }
    };

    return (
        <main className="container flex-col p-4 fade-in" style={{ paddingBottom: '120px' }}>

            <div className="flex-center" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
                <Link href={`/user/outlet/${cart.outletId}`} style={{ color: 'var(--text-main)' }}><ArrowLeft /></Link>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Checkout</h1>
            </div>

            <section className="flex-col gap-4 mb-6">
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ITEM SUMMARY</h2>
                <div className="flex-col gap-4 p-4" style={{ background: 'white', borderRadius: '0', border: '2px solid var(--border)' }}>
                    {cart.items.map((item, i) => (
                        <div key={i} className="flex-center" style={{ justifyContent: 'space-between', paddingBottom: i !== cart.items.length - 1 ? '12px' : '0', borderBottom: i !== cart.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div className="flex-center gap-3">
                                <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '0', fontWeight: 700 }}>x{item.qty}</span>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</span>
                            </div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>₹{item.price * item.qty}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '2px solid var(--border)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                        <span>To Pay</span>
                        <span style={{ color: 'var(--primary)' }}>₹{cart.total}</span>
                    </div>
                </div>
            </section>

            <section className="flex-col gap-4 mb-6">
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ORDER TYPE</h2>
                <div className="flex-col gap-3">
                    {['Dine-in', 'Delivery', 'Takeaway']
                        .filter(m => m !== 'Delivery' || outlet?.delivery)
                        .map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className="flex-center p-4 gap-3 w-full"
                                style={{
                                    background: mode === m ? '#f0fdf4' : 'white',
                                    color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
                                    border: mode === m ? '2px solid var(--accent)' : '2px solid var(--border)',
                                    borderRadius: '0',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left'
                                }}
                            >
                                {m === 'Dine-in' && <Utensils size={18} />}
                                {m === 'Delivery' && <Truck size={18} />}
                                {m === 'Takeaway' && <ShoppingBag size={18} />}
                                {m}
                                {mode === m && (
                                    <div style={{ marginLeft: 'auto', width: '18px', height: '18px', borderRadius: '50%', border: '3px solid var(--accent)' }}></div>
                                )}
                            </button>
                        ))}
                </div>
                {!outlet?.delivery && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                        ℹ️ This outlet does not offer delivery service
                    </p>
                )}
            </section>

            <section className="flex-col gap-4 mb-6 p-4" style={{ background: 'white', borderRadius: '0', border: '2px solid var(--border)' }}>
                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Name</label>
                    <input
                        placeholder="Enter your name"
                        className="p-3 w-full"
                        style={{ border: '2px solid var(--border)', borderRadius: '0', fontSize: '0.95rem', fontWeight: 500 }}
                        value={details.customerName}
                        onChange={e => setDetails({ ...details, customerName: e.target.value })}
                    />
                </div>
                {mode === 'Dine-in' && (
                    <div className="flex-col gap-2">
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Table Number (Optional)</label>
                        <input
                            placeholder="e.g. 5"
                            className="p-3 w-full"
                            style={{ border: '2px solid var(--border)', borderRadius: '0', fontSize: '0.95rem', fontWeight: 500 }}
                            value={details.tableNo}
                            onChange={e => setDetails({ ...details, tableNo: e.target.value })}
                        />
                    </div>
                )}
                {mode === 'Delivery' && (
                    <div className="flex-col gap-3">
                        <div className="flex-center" style={{ justifyContent: 'space-between' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Address</label>
                            <button
                                onClick={handleGetLocation}
                                disabled={locating}
                                className="flex-center gap-1"
                                style={{
                                    background: 'none',
                                    border: '2px solid var(--primary)',
                                    borderRadius: '0',
                                    padding: '6px 10px',
                                    color: 'var(--primary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                <Locate size={12} /> {locating ? 'Locating...' : 'Use Current Location'}
                            </button>
                        </div>
                        <textarea
                            rows={3}
                            placeholder="House No, Area, Landmark..."
                            className="p-3 w-full"
                            style={{ border: '2px solid var(--border)', borderRadius: '0', fontFamily: 'inherit', fontSize: '0.95rem' }}
                            value={details.address}
                            onChange={e => setDetails({ ...details, address: e.target.value })}
                        />
                    </div>
                )}
                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Contact for update"
                        className="p-3 w-full"
                        style={{ border: '2px solid var(--border)', borderRadius: '0', fontSize: '0.95rem', fontWeight: 500 }}
                        value={details.phone}
                        onChange={e => setDetails({ ...details, phone: e.target.value })}
                    />
                </div>
            </section>

            <section className="flex-col gap-4 mb-6">
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PAYMENT METHOD</h2>
                <div className="flex-col gap-3">
                    <div
                        onClick={() => setPaymentMethod('cash')}
                        className="flex-center p-4 gap-3"
                        style={{
                            background: paymentMethod === 'cash' ? '#f0fdf4' : 'white',
                            borderRadius: '0',
                            border: paymentMethod === 'cash' ? '2px solid var(--accent)' : '2px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Banknote size={24} color={paymentMethod === 'cash' ? 'var(--accent)' : '#64748b'} />
                        <div className="flex-col">
                            <span style={{ fontWeight: 600 }}>Pay at Counter / Cash</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay after eating or on delivery</span>
                        </div>
                        {paymentMethod === 'cash' && (
                            <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: '5px solid var(--accent)' }}></div>
                        )}
                    </div>

                    <div
                        onClick={() => setPaymentMethod('upi')}
                        className="flex-center p-4 gap-3"
                        style={{
                            background: paymentMethod === 'upi' ? '#f0fdf4' : 'white',
                            borderRadius: '0',
                            border: paymentMethod === 'upi' ? '2px solid var(--accent)' : '2px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <QrIcon size={24} color={paymentMethod === 'upi' ? 'var(--accent)' : '#64748b'} />
                        <div className="flex-col">
                            <span style={{ fontWeight: 600 }}>Scan & Pay (UPI)</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Google Pay, PhonePe, Paytm</span>
                        </div>
                        {paymentMethod === 'upi' && (
                            <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: '5px solid var(--accent)' }}></div>
                        )}
                    </div>
                </div>
            </section>

            <button
                onClick={handlePlaceOrder}
                disabled={loading}
                style={{
                    position: 'fixed', 
                    bottom: '20px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 32px)', 
                    maxWidth: '450px',
                    padding: '16px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: 'var(--shadow-lg)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    zIndex: 10,
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Processing...' : (paymentMethod === 'upi' ? `Pay Now • ₹${cart.total}` : `Place Order • ₹${cart.total}`)}
            </button>

            {showQrModal && (
                <div className="fixed top-0 left-0 w-full h-full flex-center p-4 fade-in" style={{ position: 'fixed', zIndex: 100, background: 'rgba(0,0,0,0.8)' }}>
                    <div className="flex-col p-6 w-full max-w-sm" style={{ background: 'white', borderRadius: '20px', textAlign: 'center' }}>

                        <div className="flex-center" style={{ justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowQrModal(false)}><X size={24} /></button>
                        </div>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '10px 0' }}>Scan to Pay ₹{cart.total}</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Use any UPI app to make the payment</p>

                        <div className="flex-center flex-col p-4 mb-4" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                            {outlet?.qrCode ? (
                                <img src={outlet.qrCode} alt="Payment QR" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
                            ) : (
                                <div className="flex-col flex-center p-6 text-center">
                                    <p style={{ color: 'red', fontWeight: 600 }}>No QR Code Uploaded</p>
                                    <p style={{ fontSize: '0.8rem' }}>Pay to UPI ID if available:</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '8px', fontFamily: 'monospace' }}>{outlet?.upiId || 'Not Available'}</p>
                                </div>
                            )}
                        </div>

                        {outlet?.upiId && outlet.qrCode && (
                            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                UPI ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{outlet.upiId}</span>
                            </p>
                        )}

                        <button
                            onClick={placeOrderDirect}
                            className="w-full p-3"
                            style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}
                        >
                            I have made the payment
                        </button>

                    </div>
                </div>
            )}

        </main>
    );
}
