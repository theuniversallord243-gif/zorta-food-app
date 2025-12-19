"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner() {
    const router = useRouter();
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                } catch (e) { }
            }
        };
    }, []);

    function onScanSuccess(decodedText, decodedResult) {
        if (scannerRef.current) {
            try {
                scannerRef.current.clear();
            } catch (e) { }
        }

        let outletId = decodedText;
        if (decodedText.includes('/outlet/')) {
            outletId = decodedText.split('/outlet/')[1];
        }

        router.push(`/user/outlet/${outletId}`);
    }

    function onScanFailure(error) {
        // Ignore scan failures, keep scanning
    }

    return (
        <main className="container flex-col flex-center" style={{ minHeight: '100vh', paddingTop: '40px', paddingBottom: '40px' }}>
            <Link href="/user" style={{ position: 'absolute', top: '20px', left: '20px', color: 'var(--text-main)' }}>
                <X size={24} />
            </Link>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Scan QR Code</h1>

            <div id="reader" style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden' }}></div>

            <p style={{ marginTop: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>Point your camera at the Zorta outlet QR code</p>
        </main>
    );
}
