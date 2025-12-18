"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera } from 'lucide-react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState(null);
    const scannerRef = useRef(null);
    const [isScannerActive, setIsScannerActive] = useState(false);

    useEffect(() => {
        // Only initialize if not already active
        if (!isScannerActive) {

            // Allow some time for DOM to be ready
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = scanner;
                setIsScannerActive(true);
            }, 500);

            return () => clearTimeout(timer);
        }

        // Cleanup on unmount
        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                } catch (e) {
                    // ignore cleanup errors
                }
            }
        };
    }, []);

    function onScanSuccess(decodedText, decodedResult) {
        // Handle the result
        setScanResult(decodedText);

        // Stop scanning after success logic if needed, or just redirect
        if (scannerRef.current) {
            try {
                scannerRef.current.clear();
            } catch (e) { }
        }

        alert(`Scanned: ${decodedText}`);

        // In a real app, we would check if decodedText is a valid outlet URL/ID
        // For demo, we just go to our standard demo outlet
        router.push('/user/outlet/outlet_demo_1');
    }

    function onScanFailure(error) {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    }

    // Fallback for Demo without Camera
    const handleSimulateScan = () => {
        alert("Simulation Mode: QR Detected!");
        router.push('/user/outlet/outlet_demo_1');
    };

    return (
        <main className="container flex-col" style={{ background: 'black', minHeight: '100vh', position: 'relative' }}>

            {/* Close Button */}
            <Link href="/user" style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, color: 'white' }}>
                <X size={32} />
            </Link>

            <div className="flex-col flex-center w-full" style={{ height: '100%', paddingTop: '80px', paddingBottom: '40px' }}>

                <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Scan QR Code</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '2rem' }}>Point your camera at a Zorta QR</p>

                {/* The ID 'reader' is required by html5-qrcode */}
                <div id="reader" style={{ width: '300px', borderRadius: '16px', overflow: 'hidden', background: 'white' }}></div>

                {/* Fallback Manual Entry */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '1rem' }}>Camera not working?</p>
                    <button
                        onClick={handleSimulateScan}
                        className="flex-center gap-2"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <Camera size={18} /> Simulate Scan (Demo)
                    </button>
                </div>

            </div>

        </main>
    );
}
