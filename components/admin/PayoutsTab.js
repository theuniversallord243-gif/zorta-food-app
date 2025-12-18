"use client";
import { useState, useEffect } from 'react';
import { IndianRupee, Landmark, Lock, RefreshCcw } from 'lucide-react';

export default function PayoutsTab() {
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const checkAuthorization = () => {
        const email = localStorage.getItem('admin_email');
        if (email === 'zortahelpline@gmail.com') {
            setAuthorized(true);
            return email;
        }
        setAuthorized(false);
        setLoading(false);
        return null;
    };

    const fetchData = async () => {
        const adminEmail = checkAuthorization();
        if (!adminEmail) return;

        setLoading(true);
        try {
            // 1. Fetch Orders to calculate revenue
            const ordersRes = await fetch('/api/orders');
            const orders = await ordersRes.json();

            // 2. Fetch Outlets with Security Header
            const outletsRes = await fetch('/api/outlets', {
                headers: {
                    'x-admin-email': adminEmail
                }
            });
            const outletsData = await outletsRes.json();

            // 3. Process Data
            let grandTotal = 0;
            const enriched = outletsData.map(outlet => {
                // Calculate sales for this outlet
                const outletSales = orders
                    .filter(o => o.outletId === outlet.id && o.status === 'Completed')
                    .reduce((sum, o) => sum + (o.total || 0), 0);

                grandTotal += outletSales;

                return {
                    ...outlet,
                    totalSales: outletSales
                };
            });

            setOutlets(enriched);
            setTotalRevenue(grandTotal);

        } catch (err) {
            console.error('Failed to fetch payout data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!authorized) {
        return (
            <div className="flex-col flex-center p-6" style={{ minHeight: '50vh', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Lock size={48} style={{ marginBottom: '1rem', color: '#ef4444' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Access Denied</h2>
                <p>Only the Master Admin can view Settlements & Bank Details.</p>
            </div>
        );
    }

    return (
        <div className="flex-col p-4 w-full fade-in" style={{ paddingBottom: '100px' }}>

            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Settlements & Payouts</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manual Bank Transfer for Outlets</p>
                </div>
                <button onClick={fetchData} className="p-2" style={{ background: '#f1f5f9', borderRadius: '50%', border: 'none', cursor: 'pointer' }}>
                    <RefreshCcw size={20} />
                </button>
            </div>

            {/* Stats Card */}
            <div className="p-4 mb-6 flex-center gap-4" style={{ background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', borderRadius: '16px', color: 'white' }}>
                <div className="p-3" style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                    <IndianRupee size={32} />
                </div>
                <div className="flex-col">
                    <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Completed Sales</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{totalRevenue.toLocaleString()}</span>
                </div>
            </div>

            {loading ? (
                <p className="text-center p-4">Loading Data...</p>
            ) : (
                <div className="flex-col gap-4">
                    {outlets.map(outlet => (
                        <OutletPayoutCard key={outlet.id} outlet={outlet} />
                    ))}
                </div>
            )}

        </div>
    );
}

function OutletPayoutCard({ outlet }) {
    const [showBank, setShowBank] = useState(false);

    return (
        <div className="flex-col p-4" style={{ background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>

            {/* Header */}
            <div className="flex-center mb-3" style={{ justifyContent: 'space-between' }}>
                <div className="flex-col">
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{outlet.shopName}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{outlet.ownerName}</span>
                </div>
                <div className="flex-col" style={{ alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Earnings</span>
                    <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '1.1rem' }}>₹{outlet.totalSales || 0}</span>
                </div>
            </div>

            {/* Bank Details Section */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed var(--borderColor)' }}>
                {showBank ? (
                    <div className="flex-col gap-2 fade-in">
                        <div className="flex-center" style={{ justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>BANK TRANSFER DETAILS</span>
                            <button onClick={() => setShowBank(false)} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer' }}>Hide</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                            <div>
                                <span className="block text-xs text-gray-500">Account No</span>
                                <span className="font-mono font-bold select-all">{outlet.bankAccountNumber || 'Not Set'}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500">IFSC</span>
                                <span className="font-mono font-bold select-all">{outlet.ifscCode || 'Not Set'}</span>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <span className="block text-xs text-gray-500">Holder Name</span>
                                <span className="font-bold select-all">{outlet.accountHolderName || 'Not Set'}</span>
                            </div>
                            {outlet.upiId && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span className="block text-xs text-gray-500">UPI ID</span>
                                    <span className="font-bold text-blue-600 select-all">{outlet.upiId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowBank(true)}
                        className="w-full flex-center gap-2 p-2"
                        style={{ border: '1px solid var(--border)', background: 'white', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        <Landmark size={16} /> Show Bank Details
                    </button>
                )}
            </div>

        </div>
    );
}
