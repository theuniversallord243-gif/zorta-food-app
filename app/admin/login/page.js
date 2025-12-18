"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';

export default function AdminLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Fetch outlet by email from API
            const res = await fetch(`/api/outlets?email=${formData.email}`);
            const users = await res.json();

            if (users.length === 0) {
                setError('No account found with this email.');
                setLoading(false);
                return;
            }

            const user = users[0];

            // Validate Password
            if (user.password !== formData.password) {
                setError('Incorrect password.');
                setLoading(false);
                return;
            }

            // Success!!
            localStorage.setItem('admin_token', 'secure_token_' + Date.now());
            localStorage.setItem('admin_outlet_id', user.id);
            localStorage.setItem('admin_email', user.email); // Save email for role check

            router.push('/admin/dashboard');

        } catch (err) {
            setError('Login failed. Server error.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container flex-col p-6 fade-in" style={{ justifyContent: 'center' }}>

            <div className="flex-center" style={{ justifyContent: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <Link href="/admin" style={{ color: 'var(--text-main)' }}><ArrowLeft /></Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Admin Login</h1>
            </div>

            <form onSubmit={handleLogin} className="flex-col gap-4 w-full">

                <div className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        <Mail size={16} /> Email Address
                    </label>
                    <input
                        type="email"
                        required
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="cafe@zorta.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value.trim() })}
                    />
                </div>

                <div className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        <KeyRound size={16} /> Password
                    </label>
                    <input
                        type="password"
                        required
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}

                <button
                    type="submit"
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
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="text-center" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                    <Link href="/admin/forgot-password">Forgot Password?</Link>
                </p>

            </form>
        </main>
    );
}
