"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, KeyRound, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to generate OTP');
                setLoading(false);
                return;
            }

            alert(`OTP sent to ${email}. Check your email!`);
            setStep(2);
        } catch (err) {
            setError('Error generating OTP');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Invalid OTP');
                setLoading(false);
                return;
            }

            setStep(3);
        } catch (err) {
            setError('Error verifying OTP');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password: newPassword, type: 'admin' })
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to reset password');
                setLoading(false);
                return;
            }

            alert('Password Reset Successfully! Login now.');
            router.push('/admin/login');
        } catch (err) {
            setError('Error updating password');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container flex-col p-6 fade-in" style={{ justifyContent: 'center' }}>

            <div className="flex-center" style={{ justifyContent: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <Link href="/admin/login" style={{ color: 'var(--text-main)' }}><ArrowLeft /></Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reset Password</h1>
            </div>

            <div className="flex-col gap-6 w-full">

                <div className="flex-center gap-2 mb-4">
                    <div style={{ flex: 1, height: '4px', background: step >= 1 ? 'var(--primary)' : '#e2e8f0', borderRadius: '4px' }}></div>
                    <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--primary)' : '#e2e8f0', borderRadius: '4px' }}></div>
                    <div style={{ flex: 1, height: '4px', background: step >= 3 ? 'var(--primary)' : '#e2e8f0', borderRadius: '4px' }}></div>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="flex-col gap-4">
                        <div className="flex-col gap-2">
                            <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                <Mail size={16} /> Enter Registered Email
                            </label>
                            <input
                                type="email" required
                                className="p-4"
                                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                                placeholder="cafe@zorta.com"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
                        <button type="submit" disabled={loading} className="w-full p-4"
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                            {loading ? 'Generating OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="flex-col gap-4">
                        <div className="flex-col gap-2">
                            <div className="p-4" style={{ background: '#f0fdf4', color: '#166534', borderRadius: '8px', fontSize: '0.9rem' }}>
                                OTP sent to <b>{email}</b>.
                            </div>
                            <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                <ShieldCheck size={16} /> Enter OTP
                            </label>
                            <input
                                type="text" required
                                className="p-4"
                                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center' }}
                                placeholder="000000"
                                maxLength="6"
                                value={otp} onChange={e => setOtp(e.target.value)}
                            />
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
                        <button type="submit" disabled={loading} className="w-full p-4"
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full p-2"
                            style={{ background: 'transparent', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            ← Back
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="flex-col gap-4">
                        <div className="flex-col gap-2">
                            <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                <KeyRound size={16} /> New Password
                            </label>
                            <input
                                type="password" required
                                className="p-4"
                                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                                placeholder="Min 6 characters"
                                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
                        <button type="submit" disabled={loading} className="w-full p-4"
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                            {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                        <button type="button" onClick={() => setStep(2)} className="w-full p-2"
                            style={{ background: 'transparent', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            ← Back
                        </button>
                    </form>
                )}

            </div>
        </main>
    );
}
