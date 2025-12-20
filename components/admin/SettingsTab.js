"use client";
import { useState, useEffect } from 'react';
import { Save, Building2, Mail, Phone, Clock, MapPin, QrCode } from 'lucide-react';

export default function SettingsTab({ outletId }) {
    const [outletData, setOutletData] = useState({
        shopName: '',
        description: '',
        ownerName: '',
        email: '',
        contact: '',
        address: '',
        type: 'Restaurant',
        delivery: false,
        openTime: '10:00',
        closeTime: '23:00',
        // Bank Account
        accountHolderName: '',
        bankAccountNumber: '',
        ifscCode: '',
        bankName: '',
        upiId: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Load outlet data
    useEffect(() => {
        const fetchOutlet = async () => {
            try {
                const adminEmail = localStorage.getItem('admin_email');
                const res = await fetch(`/api/outlets?email=${adminEmail}`, {
                    headers: {
                        'x-admin-email': 'zortahelpline@gmail.com' // For bank detail visibility
                    }
                });
                const outlets = await res.json();
                if (outlets.length > 0) {
                    setOutletData(outlets[0]);
                }
            } catch (err) {
                console.error('Failed to fetch outlet', err);
            }
        };

        fetchOutlet();
    }, [outletId]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/outlets', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: outletData.id,
                    ...outletData
                })
            });

            if (res.ok) {
                setMessage('Settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to save settings.');
            }
        } catch (err) {
            console.error('Failed to save', err);
            setMessage('Error saving settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-col p-4 w-full fade-in" style={{ paddingBottom: '100px' }}>

            <div className="flex-center mb-4" style={{ justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Outlet Settings</h2>
            </div>

            {message && (
                <div style={{
                    padding: '12px',
                    background: message.includes('success') ? '#d1fae5' : '#fee2e2',
                    color: message.includes('success') ? '#065f46' : '#991b1b',
                    borderRadius: '0',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSave} className="flex-col gap-4">

                {/* Shop Name */}
                <section className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        <Building2 size={16} /> Shop Name
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="Enter shop name"
                        className="p-3"
                        style={{ 
                            border: '2px solid var(--border)', 
                            borderRadius: '0',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            transition: 'border-color 0.2s',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        value={outletData.shopName}
                        onChange={e => setOutletData({ ...outletData, shopName: e.target.value })}
                    />
                </section>

                {/* Description */}
                <section className="flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Outlet Description (Visible to User)</label>
                    <textarea
                        rows={3}
                        placeholder="e.g. Authentic Italian Pizza & Pasta... Your store description here"
                        className="p-3"
                        style={{ 
                            border: '2px solid var(--border)', 
                            borderRadius: '0', 
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            resize: 'vertical',
                            minHeight: '80px',
                            transition: 'border-color 0.2s',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        value={outletData.description || ''}
                        onChange={e => setOutletData({ ...outletData, description: e.target.value })}
                    />
                </section>

                {/* Owner Name */}
                <section className="flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Owner Name</label>
                    <input
                        required
                        type="text"
                        placeholder="Enter owner full name"
                        className="p-3"
                        style={{ 
                            border: '2px solid var(--border)', 
                            borderRadius: '0',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            transition: 'border-color 0.2s',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        value={outletData.ownerName}
                        onChange={e => setOutletData({ ...outletData, ownerName: e.target.value })}
                    />
                </section>

                {/* Email (Read-only) */}
                <section className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        <Mail size={16} /> Email (Cannot be changed)
                    </label>
                    <input
                        disabled
                        className="p-3"
                        style={{ 
                            border: '2px solid #e5e7eb', 
                            borderRadius: '0', 
                            background: '#f9fafb', 
                            color: '#6b7280',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            cursor: 'not-allowed',
                            opacity: 0.7
                        }}
                        value={outletData.email}
                    />
                </section>

                {/* Contact */}
                <section className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        <Phone size={16} /> Contact Number
                    </label>
                    <input
                        required
                        type="tel"
                        placeholder="Enter 10 digit mobile number"
                        className="p-3"
                        style={{ 
                            border: '2px solid var(--border)', 
                            borderRadius: '0',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            transition: 'border-color 0.2s',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        value={outletData.contact}
                        onChange={e => setOutletData({ ...outletData, contact: e.target.value })}
                    />
                </section>

                {/* Address */}
                <section className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        <MapPin size={16} /> Address
                    </label>
                    <textarea
                        required
                        placeholder="Enter complete address with street, area, city, state, pincode"
                        className="p-3"
                        rows={3}
                        style={{ 
                            border: '2px solid var(--border)', 
                            borderRadius: '0', 
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            resize: 'vertical',
                            minHeight: '80px',
                            transition: 'border-color 0.2s',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        value={outletData.address}
                        onChange={e => setOutletData({ ...outletData, address: e.target.value })}
                    />
                </section>

                {/* Type & Delivery */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <section className="flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Type</label>
                        <select
                            className="p-3"
                            style={{ 
                                border: '2px solid var(--border)', 
                                borderRadius: '0', 
                                background: 'var(--surface)',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            value={outletData.type}
                            onChange={e => setOutletData({ ...outletData, type: e.target.value })}
                        >
                            <option>Restaurant</option>
                            <option>Cafe</option>
                            <option>Bakery</option>
                            <option>Store</option>
                        </select>
                    </section>

                    <section className="flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Delivery</label>
                        <div
                            className="p-3 flex-center"
                            style={{
                                border: outletData.delivery ? '2px solid var(--accent)' : '2px solid var(--border)',
                                borderRadius: '0',
                                color: outletData.delivery ? 'var(--accent)' : 'var(--text-muted)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: outletData.delivery ? '#ecfdf5' : 'var(--surface)',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setOutletData({ ...outletData, delivery: !outletData.delivery })}
                        >
                            {outletData.delivery ? '✓ Yes' : 'No'}
                        </div>
                    </section>
                </div>

                {/* Timings */}
                <section className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        <Clock size={16} /> Opening Hours
                    </label>
                    <div className="flex-center gap-2">
                        <input
                            type="time"
                            className="p-3 w-full"
                            value={outletData.openTime}
                            onChange={e => setOutletData({ ...outletData, openTime: e.target.value })}
                            style={{ 
                                border: '2px solid var(--border)', 
                                borderRadius: '0',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                background: 'var(--surface)',
                                color: 'var(--text-main)',
                                transition: 'border-color 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>to</span>
                        <input
                            type="time"
                            className="p-3 w-full"
                            value={outletData.closeTime}
                            onChange={e => setOutletData({ ...outletData, closeTime: e.target.value })}
                            style={{ 
                                border: '2px solid var(--border)', 
                                borderRadius: '0',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                background: 'var(--surface)',
                                color: 'var(--text-main)',
                                transition: 'border-color 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>
                </section>

                {/* Payment Settings: Upload QR Code */}
                <section className="flex-col gap-2" style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0', border: '1px solid #bbf7d0' }}>
                    <h3 className="flex-center gap-2" style={{ fontSize: '1rem', fontWeight: 700, color: '#166534' }}>
                        <QrCode size={20} /> Payment QR Code
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                        Upload your Payment QR Code (PhonePe, Paytm, GPay, etc). Customers will scan this to pay you directly.
                    </p>

                    <div className="flex-col gap-4 mt-2">
                        {outletData.qrCode && (
                            <div className="flex-col flex-center p-2" style={{ background: 'white', borderRadius: '0', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.8rem', marginBottom: '4px', fontWeight: 600 }}>Current QR Code:</span>
                                <img
                                    src={outletData.qrCode}
                                    alt="Payment QR"
                                    style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setOutletData({ ...outletData, qrCode: '' })}
                                    style={{ marginTop: '8px', fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Remove QR
                                </button>
                            </div>
                        )}

                        <div className="flex-col gap-1">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Upload New QR Image</label>
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
                                            setOutletData({ ...outletData, qrCode: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="p-2"
                                style={{ 
                                    border: '2px solid var(--border)', 
                                    borderRadius: '0', 
                                    background: 'var(--surface)',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max size: 500KB. Formats: JPG, PNG.</span>
                        </div>

                        {/* Optional UPI ID Text */}
                        <div className="flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>UPI ID (Optional Backup)</label>
                            <input
                                className="p-3"
                                type="text"
                                placeholder="e.g. yourname@okaxis"
                                style={{ 
                                    border: '2px solid var(--border)', 
                                    borderRadius: '0', 
                                    background: 'var(--surface)',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    color: 'var(--text-main)',
                                    transition: 'border-color 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                value={outletData.upiId || ''}
                                onChange={e => setOutletData({ ...outletData, upiId: e.target.value })}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This will be shown to customers as backup payment option</span>
                        </div>
                    </div>
                </section>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex-center gap-2 p-4"
                    style={{
                        marginTop: '1rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    <Save size={20} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>

            </form>

        </div>
    );
}
