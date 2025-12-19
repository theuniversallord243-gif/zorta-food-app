"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, AlertCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState('');
    const scannerRef = useRef(null);
    const [isScannerActive, setIsScannerActive] = useState(false);

    useEffect(() => {
        if (!isScannerActive) {
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );

                scanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = scanner;
                setIsScannerActive(true);
            }, 500);

            return () => clearTimeout(timer);
        }

        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                } catch (e) { }
            }
        };
    }, []);

    function onScanSuccess(decodedText, decodedResult) {
        setError('');
        setScanResult(decodedText);

        if (scannerRef.current) {
            try {
                scannerRef.current.clear();
            } catch (e) { }
        }

        validateAndNavigate(decodedText);
    }

    function onScanFailure(error) {
        // Ignore scan failures, keep scanning
    }

    const validateAndNavigate = async (qrData) => {
        try {
            if (!qrData || qrData.trim() === '') {
                setError('Invalid QR code');
                return;
            }

            let outletId = qrData;
            if (qrData.includes('/outlet/')) {
                outletId = qrData.split('/outlet/')[1];
            }

            const res = await fetch(`/api/outlets?id=${outletId}`);
            const outlets = await res.json();

            if (!outlets || outlets.length === 0) {
                setError('❌ Invalid QR code. This is not a Zorta outlet QR.');
                setTimeout(() => setError(''), 3000);
                return;
            }

            alert(`✓ Scanned: ${outlets[0].name}`);
            router.push(`/user/outlet/${outletId}`);

        } catch (err) {
            console.error('Validation error:', err);
            setError('❌ Invalid QR code. Please scan a Zorta outlet QR.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleSimulateScan = () => {
        alert("Simulation Mode: QR Detected!");
        router.push('/user/outlet/outlet_demo_1');
    };

    return (
        <main className="container flex-col" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            minHeight: '100vh', 
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>

            {/* Animated Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                pointerEvents: 'none'
            }}></div>

            {/* Close Button */}
            <Link href="/user" style={{ 
                position: 'absolute', 
                top: '24px', 
                left: '24px', 
                zIndex: 10, 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.2s'
            }}>
                <X size={24} />
            </Link>

            <div className="flex-col flex-center w-full" style={{ 
                height: '100%', 
                paddingTop: '60px', 
                paddingBottom: '40px',
                position: 'relative',
                zIndex: 1
            }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '12px',
                        marginBottom: '1.5rem',
                        animation: 'pulse 2s infinite'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            padding: '10px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Zap size={28} color='white' fill='white' />
                        </div>
                        <h2 style={{ 
                            color: 'white', 
                            fontSize: '2rem', 
                            fontWeight: 800,
                            margin: 0,
                            letterSpacing: '-0.5px',
                            textShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>Scan & Order</h2>
                    </div>
                    <p style={{ 
                        color: 'rgba(255,255,255,0.85)', 
                        fontSize: '1rem',
                        margin: 0,
                        fontWeight: 500,
                        letterSpacing: '0.3px'
                    }}>✨ Point camera at Zorta QR code</p>
                </div>

                {/* Scanner Container */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '24px',
                    padding: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    overflow: 'hidden'
                }}>
                    <div id="reader" style={{ 
                        width: '280px', 
                        borderRadius: '16px', 
                        overflow: 'hidden',
                        background: '#f3f4f6'
                    }}></div>
                </div>

                {/* Corner Guides */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '280px',
                    height: '280px',
                    pointerEvents: 'none',
                    zIndex: 2
                }}>
                    {[
                        { top: '0', left: '0', borderTop: '3px solid #fbbf24', borderLeft: '3px solid #fbbf24' },
                        { top: '0', right: '0', borderTop: '3px solid #fbbf24', borderRight: '3px solid #fbbf24' },
                        { bottom: '0', left: '0', borderBottom: '3px solid #fbbf24', borderLeft: '3px solid #fbbf24' },
                        { bottom: '0', right: '0', borderBottom: '3px solid #fbbf24', borderRight: '3px solid #fbbf24' }
                    ].map((style, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            width: '30px',
                            height: '30px',
                            ...style
                        }}></div>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{ 
                        marginTop: '2rem', 
                        background: 'rgba(220, 38, 38, 0.9)', 
                        color: 'white', 
                        padding: '14px 18px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        maxWidth: '300px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        animation: 'slideDown 0.3s ease'
                    }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Fallback Button */}
                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <p style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: '0.9rem', 
                        margin: 0,
                        marginBottom: '1rem',
                        fontWeight: 500,
                        letterSpacing: '0.2px'
                    }}>📱 Camera not working?</p>
                    <button
                        onClick={handleSimulateScan}
                        className="flex-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                            color: 'white',
                            border: '1.5px solid rgba(255,255,255,0.4)',
                            padding: '13px 28px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            marginTop: '8px',
                            letterSpacing: '0.3px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={e => {
                            e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))';
                            e.target.style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))';
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        <Camera size={18} /> Try Demo
                    </button>
                </div>

            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

        </main>
    );
}
