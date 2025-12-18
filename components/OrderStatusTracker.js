"use client";
import { useEffect, useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

export default function OrderStatusTracker({ orderId }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders?id=${orderId}`);
                const data = await res.json();
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [orderId]);

    if (loading) return <p>Loading order status...</p>;
    if (!order) return <p>Order not found</p>;

    const statuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];
    const currentIndex = statuses.indexOf(order.status);

    return (
        <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: 'var(--radius)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Order Status</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '2rem' }}>
                {statuses.map((status, index) => (
                    <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: index <= currentIndex ? 'var(--primary)' : '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                marginBottom: '0.5rem',
                                zIndex: 1
                            }}
                        >
                            {index <= currentIndex ? <CheckCircle size={24} /> : <Clock size={24} />}
                        </div>
                        <p style={{ fontSize: '0.75rem', textAlign: 'center', color: index <= currentIndex ? 'var(--primary)' : '#9ca3af' }}>
                            {status}
                        </p>
                    </div>
                ))}
            </div>

            <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <strong>Current Status:</strong> {order.status}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <strong>Payment:</strong> {order.paymentStatus}
                </p>
                {order.statusHistory && order.statusHistory.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Status History:</p>
                        {order.statusHistory.map((entry, idx) => (
                            <p key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {entry.status} - {new Date(entry.timestamp).toLocaleString()}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
