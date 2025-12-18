import Link from 'next/link';
import { Store, PlusCircle, LogIn, ArrowLeft } from 'lucide-react';

export default function AdminLanding() {
    return (
        <main className="container flex-col p-6 fade-in" style={{ justifyContent: 'center', minHeight: '100vh' }}>

            <Link href="/" style={{ position: 'absolute', top: '24px', left: '24px', color: 'var(--text-muted)' }}>
                <ArrowLeft size={24} />
            </Link>

            <div className="flex-col gap-2 text-center" style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Zorta Business</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your outlet and orders</p>
            </div>

            <div className="flex-col gap-4 w-full">

                {/* Create New Outlet */}
                <Link href="/admin/setup" className="w-full">
                    <button
                        className="w-full flex-center gap-2"
                        style={{
                            padding: '1rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        <PlusCircle size={20} />
                        Create New Outlet
                    </button>
                </Link>

                {/* Login */}
                <Link href="/admin/login" className="w-full">
                    <button
                        className="w-full flex-center gap-2"
                        style={{
                            padding: '1rem',
                            background: 'white',
                            color: 'var(--primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <LogIn size={20} />
                        Login as Existing Admin
                    </button>
                </Link>

            </div>

        </main>
    );
}
