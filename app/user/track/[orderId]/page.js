"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Clock, ChefHat, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderTracking() {
    const params = useParams();
    const orderId = params?.orderId;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders?id=${orderId}`);
                const data = await res.json();
                if (data && data.id) {
                    setOrder(data);
                } else {
                    setOrder(null);
                }
            } catch (e) { 
                console.error("Fetch error", e);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
            const interval = setInterval(fetchOrder, 3000);
            return () => clearInterval(interval);
        }
    }, [orderId]);

    const handleReportSubmit = async () => {
        if (!reportReason.trim()) {
            alert('Please provide a reason for reporting');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: orderId,
                    status: 'Cancelled',
                    report: {
                        reason: reportReason,
                        reportedAt: new Date().toISOString(),
                    }
                })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
                setShowReportModal(false);
                setReportReason('');
                alert('Order cancelled successfully');
            } else {
                alert('Failed to cancel order. Please try again.');
            }
        } catch (e) {
            console.error('Report error:', e);
            alert('Error cancelling order');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="container flex-col fade-in" style={{ paddingBottom: '40px', minHeight: '100vh', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Loading your order...</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Please wait</p>
                </div>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="container flex-col fade-in" style={{ paddingBottom: '40px', minHeight: '100vh', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Order not found</p>
                    <Link href="/user">
                        <button style={{ marginTop: '1rem', padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            Go to Home
                        </button>
                    </Link>
                </div>
            </main>
        );
    }

    const steps = [
        { status: 'New', label: 'Order Placed', icon: Clock },
        { status: 'Processing', label: 'Cooking', icon: ChefHat },
        { status: 'Ready', label: 'Ready', icon: CheckCircle },
        { status: 'Completed', label: 'Delivered', icon: ShoppingBag },
    ];

    const getCurrentStep = () => {
        const statusMap = { 'New': 0, 'Processing': 1, 'Ready': 2, 'Completed': 3 };
        return statusMap[order.status] || 0;
    };

    const activeIndex = getCurrentStep();

    return (
        <main className="container flex-col fade-in" style={{ paddingBottom: '40px' }}>

            <div className="flex-center p-4" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                <Link href="/user"><ArrowLeft /></Link>
                <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>Track Order</h1>
                <div style={{ width: '24px' }}></div>
            </div>

            <div className="p-6 text-center" style={{ background: order.status === 'Cancelled' ? '#fee2e2' : '#f0fdf4', borderBottom: '1px solid ' + (order.status === 'Cancelled' ? '#fecaca' : '#dcfce7') }}>
                <h2 style={{ color: order.status === 'Cancelled' ? '#dc2626' : '#166534', fontWeight: 800, fontSize: '1.5rem', marginBottom: '4px' }}>
                    {order.status === 'Cancelled' ? 'Order Cancelled' : order.status === 'Completed' ? 'Order Completed!' : order.status === 'Ready' ? 'Food is Ready!' : `Estimated: 15 mins`}
                </h2>
                <p style={{ color: order.status === 'Cancelled' ? '#991b1b' : '#15803d', fontSize: '0.9rem' }}>Order ID: #{orderId}</p>
                {order.status === 'Cancelled' && order.report && (
                    <p style={{ color: '#991b1b', fontSize: '0.85rem', marginTop: '8px', fontStyle: 'italic' }}>
                        Reason: {order.report.reason}
                    </p>
                )}
            </div>

            {order.status === 'Cancelled' ? (
                <div className="m-4 p-6" style={{ background: '#fef2f2', borderRadius: '16px', border: '2px solid #fecaca', textAlign: 'center' }}>
                    <h3 style={{ color: '#dc2626', fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px' }}>Order Cancelled</h3>
                    <p style={{ color: '#991b1b', fontSize: '0.95rem', marginBottom: '12px' }}>
                        Your order has been successfully cancelled.
                    </p>
                    {order.cancelledAt && (
                        <p style={{ color: '#991b1b', fontSize: '0.85rem', marginBottom: '12px' }}>
                            Cancelled on: {new Date(order.cancelledAt).toLocaleString()}
                        </p>
                    )}
                    {order.paymentStatus === 'paid' && (
                        <div style={{ background: '#fde68a', padding: '12px', borderRadius: '8px', marginTop: '16px', textAlign: 'center' }}>
                            <p style={{ color: '#92400e', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
                                Online payment detected
                            </p>
                            <p style={{ color: '#92400e', fontSize: '0.85rem', marginBottom: '4px' }}>
                                For refund details, please contact us at:
                            </p>
                            <a href="mailto:zortahelpline@gmail.com" style={{ color: '#dc2626', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', wordBreak: 'break-all' }}>
                                zortahelpline@gmail.com
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-col p-6 gap-6" style={{ marginTop: '1rem' }}>
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                        <div key={idx} className="flex-center" style={{ gap: '1rem', opacity: isActive ? 1 : 0.4 }}>
                            <div className="flex-col flex-center" style={{ gap: '4px' }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '50%',
                                    background: isActive ? 'var(--primary)' : '#e2e8f0',
                                    color: isActive ? 'white' : '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: isCurrent ? '0 0 0 4px rgba(15, 23, 42, 0.2)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <Icon size={24} />
                                </div>
                                {idx !== steps.length - 1 && (
                                    <div style={{ width: '2px', height: '30px', background: idx < activeIndex ? 'var(--primary)' : '#e2e8f0' }}></div>
                                )}
                            </div>
                            <div className="flex-col" style={{ paddingBottom: idx !== steps.length - 1 ? '30px' : '0' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{step.label}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {isActive && isCurrent ? 'Happening now' : isActive ? 'Done' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
            )}

            <div className="m-4 p-4" style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Order Details</h3>
                <div className="flex-col gap-2">
                    {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span>{item.qty} x {item.name}</span>
                            <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>Total Amount</span>
                        <span>₹{order.totalAmount || order.total}</span>
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>Payment Status</span>
                        <span style={{ fontWeight: 600, color: order.paymentStatus === 'paid' ? '#16a34a' : '#f59e0b' }}>
                            {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 pt-0">
                <Link href="/user">
                    <button className="w-full p-4" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        Go to Home
                    </button>
                </Link>
                {order.status !== 'Cancelled' && (
                    <button 
                        onClick={() => setShowReportModal(true)}
                        className="w-full p-4 mt-3" 
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        Report Order
                    </button>
                )}
            </div>

            {showReportModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowReportModal(false)}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '90%', width: '400px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>Report Order</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Why are you cancelling this order? This will help us improve our service.
                        </p>

                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Enter reason for cancellation (e.g., Order incorrect, Quality issue, Long wait time, etc.)"
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)',
                                fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px',
                                marginBottom: '16px'
                            }}
                        />

                        <div className="flex-center gap-3" style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowReportModal(false)}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)',
                                    background: 'white', cursor: 'pointer', fontWeight: 600,
                                    opacity: isSubmitting ? 0.6 : 1
                                }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleReportSubmit}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                                    background: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: 600,
                                    opacity: isSubmitting ? 0.6 : 1
                                }}>
                                {isSubmitting ? 'Submitting...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}
