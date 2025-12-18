"use client";
import { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingForm({ orderId, outletId, userId, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (rating === 0) {
                setError('Please select a rating');
                setLoading(false);
                return;
            }

            const res = await fetch('/api/rating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    outletId,
                    userId,
                    rating,
                    comment
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to submit rating');
                setLoading(false);
                return;
            }

            setSuccess(true);
            setRating(0);
            setComment('');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError('Error submitting rating');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: 'var(--radius)', border: '1px solid #d1fae5' }}>
                <p style={{ color: '#065f46', fontWeight: 600 }}>Thank you for your rating!</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: 'var(--radius)' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Rate this Order</h3>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    Rating
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            <Star
                                size={32}
                                fill={star <= rating ? '#fbbf24' : 'none'}
                                color={star <= rating ? '#fbbf24' : '#d1d5db'}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    Comment (Optional)
                </label>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    maxLength={500}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        minHeight: '80px'
                    }}
                    placeholder="Share your experience..."
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {comment.length}/500
                </p>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

            <button
                type="submit"
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
        </form>
    );
}
