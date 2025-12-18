"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, UtensilsCrossed, QrCode, Settings, LogOut, IndianRupee } from 'lucide-react';
import styles from './dashboard.module.css';

import OrdersTab from '@/components/admin/OrdersTab';
import MenuTab from '@/components/admin/MenuTab';
import QRTab from '@/components/admin/QRTab';
import SettingsTab from '@/components/admin/SettingsTab';
import PayoutsTab from '@/components/admin/PayoutsTab';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('orders');
    const [outletId, setOutletId] = useState(null);
    const [isMasterAdmin, setIsMasterAdmin] = useState(false);

    useEffect(() => {
        // Check auth
        const id = localStorage.getItem('admin_outlet_id');
        const email = localStorage.getItem('admin_email');
        if (id) setOutletId(id);
        if (email === 'zortahelpline@gmail.com') {
            setIsMasterAdmin(true);
            setActiveTab('payouts'); // Default to Payouts for master admin
        }
    }, []);

    return (
        <main className="container flex-col" style={{ background: 'var(--background)', minHeight: '100vh' }}>

            {/* Top Bar */}
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>Dashboard</h1>
                <button className={styles.logoutBtn} onClick={() => window.location.href = '/admin'}>
                    <LogOut size={20} />
                </button>
            </header>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
                {activeTab === 'orders' && <OrdersTab outletId={outletId} />}
                {activeTab === 'menu' && <MenuTab outletId={outletId} />}
                {activeTab === 'qr' && <QRTab outletId={outletId} />}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'payouts' && <PayoutsTab />}
            </div>

            {/* Bottom Navigation */}
            <nav className={styles.bottomNav}>
                {!isMasterAdmin && (
                    <>
                        <button
                            className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''} `}
                            onClick={() => setActiveTab('orders')}
                        >
                            <LayoutDashboard size={24} />
                            <span>Orders</span>
                        </button>

                        <button
                            className={`${styles.navItem} ${activeTab === 'menu' ? styles.active : ''} `}
                            onClick={() => setActiveTab('menu')}
                        >
                            <UtensilsCrossed size={24} />
                            <span>Menu</span>
                        </button>

                        <button
                            className={`${styles.navItem} ${activeTab === 'qr' ? styles.active : ''} `}
                            onClick={() => setActiveTab('qr')}
                        >
                            <QrCode size={24} />
                            <span>Scanner</span>
                        </button>
                    </>
                )}

                {isMasterAdmin && (
                    <button
                        className={`${styles.navItem} ${activeTab === 'payouts' ? styles.active : ''} `}
                        onClick={() => setActiveTab('payouts')}
                    >
                        <IndianRupee size={24} />
                        <span>Payout</span>
                    </button>
                )}

                <button
                    className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''} `}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={24} />
                    <span>Settings</span>
                </button>
            </nav>

        </main>
    );
}
