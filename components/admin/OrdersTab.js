"use client";
import { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, ChefHat, XCircle, CreditCard, Banknote } from 'lucide-react';

export default function OrdersTab({ outletId }) {
    const [orders, setOrders] = useState([]);
    const [loadingOrderId, setLoadingOrderId] = useState(null);
    const prevOrdersRef = useRef([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                const allOrders = await res.json();

                const outletOrders = allOrders
                    .filter(o => o.outletId === outletId)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                if (prevOrdersRef.current.length > 0 && outletOrders.length > prevOrdersRef.current.length) {
                    const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
                    audio.play().catch(e => console.error("Audio play failed", e));
                }

                setOrders(outletOrders);
                prevOrdersRef.current = outletOrders;

            } catch (err) {
                console.error('Failed to fetch orders', err);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [outletId]);

    const updateStatus = async (orderId, newStatus) => {
        setLoadingOrderId(orderId);
        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus })
            });

            if (res.ok) {
                const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
                setOrders(updated);
            } else {
                alert('Failed to update order status');
            }
        } catch (err) {
            console.error('Failed to update order', err);
            alert('Error updating order');
        } finally {
            setLoadingOrderId(null);
        }
    };

    const updatePaymentStatus = async (orderId, newPaymentStatus) => {
        setLoadingOrderId(orderId);
        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, paymentStatus: newPaymentStatus })
            });

            if (res.ok) {
                const updated = orders.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o);
                setOrders(updated);
            } else {
                alert('Failed to update payment status');
            }
        } catch (err) {
            console.error('Failed to update payment status', err);
            alert('Error updating payment');
        } finally {
            setLoadingOrderId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return '#3b82f6';
            case 'Processing': return '#eab308';
            case 'Ready': return '#10b981';
            case 'Completed': return '#64748b';
            default: return '#cbd5e1';
        }
    };

    const getPaymentStatusColor = (paymentStatus) => {
        switch (paymentStatus) {
            case 'completed': return '#10b981';
            case 'pending': return '#ef4444';
            case 'failed': return '#dc2626';
            default: return '#cbd5e1';
        }
    };

    const getPaymentStatusLabel = (paymentStatus) => {
        switch (paymentStatus) {
            case 'completed': return '✓ Paid';
            case 'pending': return '⏳ Pending';
            case 'failed': return '✗ Failed';
            default: return 'Unknown';
        }
    };

    return (
        <div className="flex-col p-4 w-full fade-in" style={{ paddingBottom: '100px' }}>

            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Live Orders</h2>
                <span style={{ fontSize: '0.875rem', background: '#e2e8f0', padding: '4px 8px', borderRadius: '12px' }}>
                    {orders.length} Active
                </span>
            </div>

            {orders.length === 0 ? (
                <div className="text-center p-6 flex-col flex-center" style={{ color: 'var(--text-muted)', minHeight: '30vh' }}>
                    <Clock size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No active orders right now.</p>
                    <p style={{ fontSize: '0.8rem' }}>New orders will pop up here instantly.</p>
                </div>
            ) : (
                <div className="flex-col gap-4">
                    {orders.map(order => (
                        <div key={order.id} className="flex-col p-4" style={{ background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', borderLeft: `4px solid ${getStatusColor(order.status)}` }}>

                            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>#{order.id?.slice(-4) || '....'}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className="flex-col gap-1 mb-3" style={{ fontSize: '0.9rem' }}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex-center" style={{ justifyContent: 'space-between' }}>
                                        <span>{item.qty} x {item.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px dashed var(--border)', marginTop: '4px', paddingTop: '4px', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Total</span>
                                    <span>₹{order.total}</span>
                                </div>
                            </div>

                            <div className="flex-col gap-2 mb-3 p-3" style={{ background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                                <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>📍 {order.mode || 'Dine-in'}</span>
                                </div>
                                {order.details?.phone && (
                                    <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                                        <span style={{ fontWeight: 600 }}>📞</span>
                                        <span>{order.details.phone}</span>
                                    </div>
                                )}
                                {order.details?.tableNo && (
                                    <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                                        <span style={{ fontWeight: 600 }}>🪑 Table:</span>
                                        <span>{order.details.tableNo}</span>
                                    </div>
                                )}
                                {order.details?.address && (
                                    <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                                        <span style={{ fontWeight: 600 }}>🏠</span>
                                        <span>{order.details.address}</span>
                                    </div>
                                )}
                                {order.details?.note && (
                                    <div className="flex-col gap-1" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--border)' }}>
                                        <span style={{ fontWeight: 600 }}>📝 Note:</span>
                                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{order.details.note}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-col gap-2 mb-3 p-3" style={{ background: order.paymentStatus === 'completed' ? '#ecfdf5' : '#fef2f2', borderRadius: '0', fontSize: '0.85rem' }}>
                                <div className="flex-center gap-2" style={{ justifyContent: 'space-between' }}>
                                    <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                                        {order.paymentMethod === 'online' ? (
                                            <CreditCard size={18} style={{ color: getPaymentStatusColor(order.paymentStatus) }} />
                                        ) : (
                                            <Banknote size={18} style={{ color: getPaymentStatusColor(order.paymentStatus) }} />
                                        )}
                                        <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                                            {order.paymentMethod === 'online' ? '💳 Online' : '💰 Cash'}
                                        </span>
                                    </div>
                                    <span style={{ fontWeight: 700, color: getPaymentStatusColor(order.paymentStatus), textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        {getPaymentStatusLabel(order.paymentStatus)}
                                    </span>
                                </div>
                                {order.paymentMethod === 'online' && order.paymentId && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '4px', borderTop: '1px dashed var(--border)' }}>
                                        Transaction ID: {order.paymentId.slice(-8)}
                                    </div>
                                )}
                                {order.paymentMethod === 'cash' && order.paymentStatus === 'pending' && (
                                    <button
                                        onClick={() => updatePaymentStatus(order.id, 'completed')}
                                        disabled={loadingOrderId === order.id}
                                        style={{
                                            marginTop: '8px',
                                            padding: '8px 12px',
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0',
                                            cursor: loadingOrderId === order.id ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            opacity: loadingOrderId === order.id ? 0.6 : 1
                                        }}
                                    >
                                        {loadingOrderId === order.id ? '⏳ Processing...' : '✓ Mark Cash Received'}
                                    </button>
                                )}
                            </div>

                            <div className="flex-col gap-2">
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: getStatusColor(order.status), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Status: {order.status}
                                </div>

                                <div className="flex-center gap-2">
                                    {order.status === 'New' && (
                                        <button 
                                            onClick={() => updateStatus(order.id, 'Processing')} 
                                            disabled={loadingOrderId === order.id}
                                            className="w-full p-2" 
                                            style={{ background: '#eab308', color: 'white', border: 'none', borderRadius: '8px', cursor: loadingOrderId === order.id ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: loadingOrderId === order.id ? 0.6 : 1 }}>
                                            {loadingOrderId === order.id ? '⏳ Processing...' : 'Accept & Cook'}
                                        </button>
                                    )}
                                    {order.status === 'Processing' && (
                                        <button 
                                            onClick={() => updateStatus(order.id, 'Ready')} 
                                            disabled={loadingOrderId === order.id}
                                            className="w-full p-2" 
                                            style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: loadingOrderId === order.id ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: loadingOrderId === order.id ? 0.6 : 1 }}>
                                            {loadingOrderId === order.id ? '⏳ Processing...' : 'Mark Ready'}
                                        </button>
                                    )}
                                    {order.status === 'Ready' && (
                                        <button 
                                            onClick={() => updateStatus(order.id, 'Completed')} 
                                            disabled={loadingOrderId === order.id}
                                            className="w-full p-2" 
                                            style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: loadingOrderId === order.id ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: loadingOrderId === order.id ? 0.6 : 1 }}>
                                            {loadingOrderId === order.id ? '⏳ Processing...' : 'Complete Order'}
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
