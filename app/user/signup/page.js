"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, User, KeyRound } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function UserSignup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // Save essential session info
                localStorage.setItem('user_id', data.id);
                localStorage.setItem('user_token', 'temp_token');
                localStorage.setItem('user_name', data.name);
                localStorage.setItem('user_email', data.email);
                router.push('/user');
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
        <main className="container flex-col p-6 fade-in" style={{ justifyContent: 'center' }}>
            <div className="flex-center" style={{ justifyContent: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <Link href="/user/login" style={{ color: 'var(--text-main)' }}><ArrowLeft /></Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Account</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-4 w-full">

                <section className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        <User size={16} /> Full Name
                    </label>
                    <input
                        required
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </section>

                <section className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        <Mail size={16} /> Email Address
                    </label>
                    <input
                        required
                        type="email"
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="e.g. rahul@gmail.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value.trim() })}
                    />
                </section>

                <section className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        <Phone size={16} /> Phone Number
                    </label>
                    <input
                        required
                        type="tel"
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="e.g. 98765 43210"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                </section>

                <section className="flex-col gap-2">
                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        <KeyRound size={16} /> Password
                    </label>
                    <input
                        required
                        type="password"
                        className="p-4"
                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                </section>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-4"
                    style={{
                        marginTop: '1rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                {/* Divider */}
                <div className="flex-center gap-4" style={{ margin: '1rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>

                {/* Google Sign-in Button */}
                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/user' })}
                    className="w-full p-4 flex-center gap-3"
                    style={{
                        background: 'white',
                        color: '#333',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <p className="text-center" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                    Already have an account? <Link href="/user/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
                </p>

            </form>
        </main>
    );
}
