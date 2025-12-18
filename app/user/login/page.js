"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, KeyRound, X } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function UserLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOTP, setForgotOTP] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false
            });

            if (result?.error) {
                setError(result.error);
            } else if (result?.ok) {
                router.push('/user');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordStep1 = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotError('');

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });

            const data = await res.json();

            if (!res.ok) {
                setForgotError(data.error || 'Failed to send OTP');
                setForgotLoading(false);
                return;
            }

            setForgotPasswordStep(2);
        } catch (err) {
            setForgotError('Error sending OTP. Please try again.');
            console.error(err);
        } finally {
            setForgotLoading(false);
        }
    };

    const handleForgotPasswordStep2 = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotError('');

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp: forgotOTP })
            });

            const data = await res.json();

            if (!res.ok) {
                setForgotError(data.error || 'Invalid OTP');
                setForgotLoading(false);
                return;
            }

            setForgotPasswordStep(3);
        } catch (err) {
            setForgotError('Error verifying OTP. Please try again.');
            console.error(err);
        } finally {
            setForgotLoading(false);
        }
    };

    const handleForgotPasswordStep3 = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotError('');

        try {
            if (newPassword.length < 6) {
                setForgotError('Password must be at least 6 characters.');
                setForgotLoading(false);
                return;
            }

            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: forgotEmail,
                    password: newPassword
                })
            });

            if (!res.ok) {
                setForgotError('Failed to reset password. Try again.');
                setForgotLoading(false);
                return;
            }

            setShowForgotPassword(false);
            setForgotPasswordStep(1);
            setForgotEmail('');
            setForgotOTP('');
            setNewPassword('');
            setError('Password reset successful! Please login with your new password.');
        } catch (err) {
            setForgotError('Error resetting password. Please try again.');
            console.error(err);
        } finally {
            setForgotLoading(false);
        }
    };

    const closeForgotPasswordModal = () => {
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setForgotEmail('');
        setForgotOTP('');
        setNewPassword('');
        setForgotError('');
    };

    return (
        <main className="container flex-col p-6 fade-in" style={{ justifyContent: 'center' }}>

            <div className="flex-center" style={{ justifyContent: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <Link href="/" style={{ color: 'var(--text-main)' }}><ArrowLeft /></Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>User Login</h1>
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
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value.trim() })}
                    />
                </div>

                <div className="flex-col gap-2">
                    <div className="flex-center" style={{ justifyContent: 'space-between', gap: '0.5rem' }}>
                        <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            <KeyRound size={16} /> Password
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                        >
                            Forgot?
                        </button>
                    </div>
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

                <div className="flex-center gap-4" style={{ margin: '1rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>

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
                    Don't have an account? <Link href="/user/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up</Link>
                </p>

            </form>

            {showForgotPassword && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 'var(--radius)',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reset Password</h2>
                            <button
                                type="button"
                                onClick={closeForgotPasswordModal}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {forgotPasswordStep === 1 && (
                            <form onSubmit={handleForgotPasswordStep1} className="flex-col gap-4">
                                <div className="flex-col gap-2">
                                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="p-3"
                                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                                        placeholder="your@email.com"
                                        value={forgotEmail}
                                        onChange={e => setForgotEmail(e.target.value.trim())}
                                    />
                                </div>
                                {forgotError && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{forgotError}</p>}
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    style={{
                                        padding: '0.75rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: forgotLoading ? 'not-allowed' : 'pointer',
                                        opacity: forgotLoading ? 0.7 : 1
                                    }}
                                >
                                    {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>
                        )}

                        {forgotPasswordStep === 2 && (
                            <form onSubmit={handleForgotPasswordStep2} className="flex-col gap-4">
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    We've sent an OTP to <strong>{forgotEmail}</strong>
                                </p>
                                <div className="flex-col gap-2">
                                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Enter OTP</label>
                                    <input
                                        type="text"
                                        required
                                        className="p-3"
                                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '1rem', letterSpacing: '4px', textAlign: 'center' }}
                                        placeholder="000000"
                                        maxLength="6"
                                        value={forgotOTP}
                                        onChange={e => setForgotOTP(e.target.value)}
                                    />
                                </div>
                                {forgotError && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{forgotError}</p>}
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    style={{
                                        padding: '0.75rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: forgotLoading ? 'not-allowed' : 'pointer',
                                        opacity: forgotLoading ? 0.7 : 1
                                    }}
                                >
                                    {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForgotPasswordStep(1)}
                                    style={{ padding: '0.5rem', background: 'transparent', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                                >
                                    ← Back
                                </button>
                            </form>
                        )}

                        {forgotPasswordStep === 3 && (
                            <form onSubmit={handleForgotPasswordStep3} className="flex-col gap-4">
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Enter your new password for <strong>{forgotEmail}</strong>
                                </p>
                                <div className="flex-col gap-2">
                                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="p-3"
                                        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                </div>
                                {forgotError && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{forgotError}</p>}
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    style={{
                                        padding: '0.75rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: forgotLoading ? 'not-allowed' : 'pointer',
                                        opacity: forgotLoading ? 0.7 : 1
                                    }}
                                >
                                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForgotPasswordStep(2)}
                                    style={{ padding: '0.5rem', background: 'transparent', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                                >
                                    ← Back
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
