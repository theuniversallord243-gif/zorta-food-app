"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, MapPin, Clock } from 'lucide-react';
import { createOutlet } from '@/lib/store';

export default function OutletSetup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        ownerName: '',
        contact: '',
        email: '', // New Email field
        password: '', // New password field
        shopName: '',
        address: '',
        type: 'Restaurant',
        delivery: false,
        openTime: '10:00',
        closeTime: '23:00'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/outlets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // Save essential session info (simulated login after signup)
                localStorage.setItem('admin_outlet_id', data.id);
                localStorage.setItem('admin_email', data.email);
                localStorage.setItem('admin_token', 'temp_token');
                router.push('/admin/dashboard');
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error('Signup failed', error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container flex-col p-6 fade-in">
            <div className="flex-center" style={{ justifyContent: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <Link href="/admin" style={{ color: 'var(--text-main)' }}><ArrowLeft /></Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Outlet Setup</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-4 w-full" style={{ paddingBottom: '2rem' }}>

                {/* Owner Details */}
                <section className="flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Owner Name</label>
                    <input
                        required
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="e.g. Rahul Sharma"
                        value={formData.ownerName}
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    />
                </section>

                <section className="flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Contact Number</label>
                    <input
                        required
                        type="tel"
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="e.g. 98765 43210"
                        value={formData.contact}
                        onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    />
                </section>

                <section className="flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email Address</label>
                    <input
                        required
                        type="email"
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="e.g. cafe@zorta.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </section>

                <section className="flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Set Password</label>
                    <input
                        required
                        type="password"
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                </section>

                {/* Shop Details */}
                <section className="flex-col gap-2" style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Shop / Outlet Name</label>
                    <input
                        required
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="e.g. Zorta Cafe"
                        value={formData.shopName}
                        onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                    />
                </section>

                <section className="flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Address</label>
                    <textarea
                        required
                        className="p-4"
                        rows={3}
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit' }}
                        placeholder="Shop No, Street, Area..."
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                </section>

                {/* Type & Timing */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <section className="flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Type</label>
                        <select
                            className="p-4"
                            style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white' }}
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option>Restaurant</option>
                            <option>Cafe</option>
                            <option>Bakery</option>
                            <option>Store</option>
                        </select>
                    </section>

                    <section className="flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Delivery?</label>
                        <div
                            className="p-4 flex-center"
                            style={{
                                border: formData.delivery ? '2px solid var(--accent)' : '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                color: formData.delivery ? 'var(--accent)' : 'var(--text-muted)',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            onClick={() => setFormData({ ...formData, delivery: !formData.delivery })}
                        >
                            {formData.delivery ? 'Yes' : 'No'}
                        </div>
                    </section>
                </div>

                {/* Timings */}
                <section className="flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Opening Hours</label>
                    <div className="flex-center gap-2">
                        <input type="time" className="p-4 w-full" value={formData.openTime} onChange={e => setFormData({ ...formData, openTime: e.target.value })} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
                        <span>to</span>
                        <input type="time" className="p-4 w-full" value={formData.closeTime} onChange={e => setFormData({ ...formData, closeTime: e.target.value })} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
                    </div>
                </section>

                {/* Payment Settings: Upload QR Code */}
                <section className="flex-col gap-2" style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: 'var(--radius)', border: '1px solid #bbf7d0' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534' }}>Payment QR Code</h2>
                    <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                        Upload your Payment QR Code (PhonePe, Paytm, GPay, etc). Customers will scan this to pay you directly.
                    </p>

                    <div className="flex-col gap-4 mt-2">
                        {formData.qrCode && (
                            <div className="flex-col flex-center p-2" style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.8rem', marginBottom: '4px', fontWeight: 600 }}>Preview:</span>
                                <img
                                    src={formData.qrCode}
                                    alt="Payment QR"
                                    style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, qrCode: '' })}
                                    style={{ marginTop: '8px', fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Remove QR
                                </button>
                            </div>
                        )}

                        <div className="flex-col gap-1">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Upload QR Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (file.size > 500 * 1024) { // 500KB limit
                                            alert("File is too large! Please upload an image under 500KB.");
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, qrCode: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="p-2"
                                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max size: 500KB (JPG/PNG)</span>
                        </div>

                        {/* Optional UPI ID Text */}
                        <div className="flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>UPI ID (Optional Backup)</label>
                            <input
                                className="p-3"
                                placeholder="e.g. yourname@okaxis"
                                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white' }}
                                value={formData.upiId || ''}
                                onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                <button
                    type="submit"
                    className="w-full flex-center gap-2"
                    disabled={loading}
                    style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    {loading ? 'Creating...' : 'Save & Generate QR'}
                </button>

            </form>
        </main>
    );
}
