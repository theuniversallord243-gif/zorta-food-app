"use client";
import { useEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Share2, Printer } from 'lucide-react';

export default function QRTab({ outletId }) {
    const [url, setUrl] = useState('');
    const qrRef = useRef();

    useEffect(() => {
        // Determine current host
        const host = window.location.host; // e.g. localhost:3000
        // Construct the user-facing URL for this outlet
        const fullUrl = `${window.location.protocol}//${host}/user/outlet/${outletId}`;
        setUrl(fullUrl);
    }, [outletId]);

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector('canvas');
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = `zorta-qr-${outletId}.png`;
        link.click();
    };

    return (
        <div className="flex-col flex-center p-6 gap-4 fade-in">

            <div className="text-center">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Shop QR Code</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Scan this to order from your shop.
                </p>
            </div>

            {/* QR Display Card */}
            <div
                ref={qrRef}
                className="flex-center"
                style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)'
                }}
            >
                {url ? (
                    <QRCodeCanvas
                        value={url}
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                ) : (
                    <p>Generating...</p>
                )}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '300px', textAlign: 'center' }}>
                Paste this QR code on tables, counters, or your entrance.
            </p>

            {/* Actions */}
            <div className="flex-col w-full gap-2" style={{ maxWidth: '300px' }}>
                <button
                    onClick={downloadQR}
                    className="flex-center gap-2 w-full p-4"
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Download size={18} /> Download Image
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                        className="flex-center gap-2 w-full p-4"
                        style={{
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                        onClick={() => alert("Printer dialog mock open")}
                    >
                        <Printer size={18} /> Print
                    </button>
                    <button
                        className="flex-center gap-2 w-full p-4"
                        style={{
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                        onClick={() => navigator.clipboard.writeText(url).then(() => alert("Link Copied!"))}
                    >
                        <Share2 size={18} /> Share
                    </button>
                </div>
            </div>

        </div>
    );
}
