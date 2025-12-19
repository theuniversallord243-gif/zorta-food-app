"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, LogOut, History, Settings, Upload, X } from 'lucide-react';

export default function UserProfile() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [userImage, setUserImage] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [showImageMenu, setShowImageMenu] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('user_token');
        if (!token) {
            router.push('/user/login');
            return;
        }

        const userId = localStorage.getItem('user_id');
        const userName = localStorage.getItem('user_name');
        const userEmail = localStorage.getItem('user_email');

        setUserData({
            id: userId,
            name: userName,
            email: userEmail
        });

        const savedImage = localStorage.getItem('user_image');
        if (savedImage) setUserImage(savedImage);

        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                const allOrders = await res.json();
                const userOrders = allOrders.filter(o => o.userEmail === userEmail || o.details?.email === userEmail);
                setOrders(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (err) {
                console.error('Failed to fetch orders', err);
            }
        };

        if (userEmail) fetchOrders();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_cart');
        localStorage.removeItem('user_image');
        router.push('/user/login');
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    try {
                        const img = new Image();
                        img.src = event.target.result;
                        
                        img.onload = () => {
                            try {
                                const canvas = document.createElement('canvas');
                                let width = img.width;
                                let height = img.height;

                                if (width > 300) {
                                    height = (height * 300) / width;
                                    width = 300;
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, width, height);

                                canvas.toBlob(
                                    (blob) => {
                                        try {
                                            const blobReader = new FileReader();
                                            blobReader.onload = () => {
                                                resolve(blobReader.result);
                                            };
                                            blobReader.onerror = () => {
                                                resolve(event.target.result);
                                            };
                                            blobReader.readAsDataURL(blob);
                                        } catch (err) {
                                            console.error('Blob reading error:', err);
                                            resolve(event.target.result);
                                        }
                                    },
                                    'image/jpeg',
                                    0.5
                                );
                            } catch (err) {
                                console.error('Canvas error:', err);
                                reject(new Error('Failed to process image'));
                            }
                        };
                        
                        img.onerror = () => {
                            reject(new Error('Failed to load image'));
                        };
                    } catch (err) {
                        console.error('Image creation error:', err);
                        reject(new Error('Failed to process image'));
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Failed to read file'));
                };

                reader.readAsDataURL(file);
            } catch (err) {
                console.error('FileReader setup error:', err);
                reject(new Error('Failed to setup file reader'));
            }
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadStatus('Please select an image file.');
            setTimeout(() => setUploadStatus(''), 3000);
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setUploadStatus('File too large! Max 2MB allowed.');
            setTimeout(() => setUploadStatus(''), 3000);
            return;
        }

        setUploadStatus('Uploading...');
        try {
            const compressedImage = await compressImage(file);
            setUserImage(compressedImage);
            localStorage.setItem('user_image', compressedImage);
            setUploadStatus('✓ Picture updated!');
            setTimeout(() => setUploadStatus(''), 2000);
        } catch (err) {
            console.error('Image compression failed:', err);
            setUploadStatus('❌ Upload failed. Try a smaller image.');
            setTimeout(() => setUploadStatus(''), 4000);
        }
    };

    const removeImage = () => {
        setUserImage(null);
        localStorage.removeItem('user_image');
        setShowImageMenu(false);
        setUploadStatus('Picture removed.');
        setTimeout(() => setUploadStatus(''), 2000);
    };

    if (!userData) return <div className="p-6">Loading...</div>;

    return (
        <main className="container flex-col" style={{ paddingBottom: '80px' }}>

            <div className="flex-center p-4" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                <Link href="/user"><ArrowLeft size={24} /></Link>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Account</h1>
                <div style={{ width: '24px' }}></div>
            </div>

            <div className="p-6 flex-col flex-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: 'white', textAlign: 'center' }}>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    {userImage ? (
                        <img src={userImage} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }} />
                    ) : (
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white' }}>
                            <User size={50} />
                        </div>
                    )}
                    <button 
                        onClick={() => setShowImageMenu(!showImageMenu)}
                        style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--accent)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white', padding: 0 }}>
                        <Upload size={18} color="white" />
                    </button>

                    {showImageMenu && (
                        <div style={{ 
                            position: 'absolute', 
                            bottom: '50px', 
                            right: '0',
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 100,
                            minWidth: '160px',
                            overflow: 'hidden'
                        }}>
                            <label htmlFor="profileImageInput" style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px', 
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }} onClick={() => setTimeout(() => setShowImageMenu(false), 100)}>
                                <Upload size={16} />
                                {userImage ? 'Change Picture' : 'Upload Picture'}
                            </label>
                            <input
                                id="profileImageInput"
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImageUpload}
                            />
                            
                            {userImage && (
                                <button 
                                    onClick={removeImage}
                                    style={{ 
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 16px', 
                                        cursor: 'pointer',
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        textAlign: 'left'
                                    }}>
                                    <X size={16} />
                                    Remove Picture
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>{userData.name}</h2>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{userData.email}</p>
                {uploadStatus && (
                    <p style={{ fontSize: '0.8rem', marginTop: '8px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px' }}>
                        {uploadStatus}
                    </p>
                )}
            </div>

            <div className="flex-center gap-4 p-4" style={{ borderBottom: '1px solid var(--border)', justifyContent: 'flex-start', overflowX: 'auto' }}>
                <button
                    onClick={() => setActiveTab('profile')}
                    style={{
                        padding: '8px 16px',
                        border: 'none',
                        background: activeTab === 'profile' ? 'var(--primary)' : 'white',
                        color: activeTab === 'profile' ? 'white' : 'var(--text-main)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Settings size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                        padding: '8px 16px',
                        border: 'none',
                        background: activeTab === 'orders' ? 'var(--primary)' : 'white',
                        color: activeTab === 'orders' ? 'white' : 'var(--text-main)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <History size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    Orders ({orders.length})
                </button>
            </div>

            {activeTab === 'profile' && (
                <div className="flex-col gap-6 p-6">
                    <div className="flex-col p-6" style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Personal Information</h3>

                        <div className="flex-col gap-4">
                            <div className="flex-col gap-2">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
                                <div className="flex-center gap-2 p-3" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <User size={16} color="var(--text-muted)" />
                                    <span style={{ fontWeight: 600 }}>{userData.name}</span>
                                </div>
                            </div>

                            <div className="flex-col gap-2">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</label>
                                <div className="flex-center gap-2 p-3" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <Mail size={16} color="var(--text-muted)" />
                                    <span style={{ fontWeight: 600 }}>{userData.email}</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                                ℹ️ To update your profile, please use the signup form or contact support.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '1rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="flex-col gap-4 p-6">
                    {orders.length === 0 ? (
                        <div className="text-center p-6 flex-col flex-center" style={{ color: 'var(--text-muted)', minHeight: '30vh' }}>
                            <History size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 600, marginBottom: '4px' }}>No orders yet</p>
                            <p style={{ fontSize: '0.9rem' }}>Start ordering from your favorite restaurants!</p>
                            <Link href="/user" style={{ marginTop: '1rem' }}>
                                <button style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                    Browse Restaurants
                                </button>
                            </Link>
                        </div>
                    ) : (
                        orders.map(order => (
                            <Link key={order.id} href={`/user/track/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div className="flex-col">
                                            <span style={{ fontWeight: 700 }}>Order #{order.id?.slice(-6) || 'N/A'}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex-col" style={{ alignItems: 'flex-end' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, background: order.status === 'Completed' ? '#d1fae5' : '#fef3c7', color: order.status === 'Completed' ? '#065f46' : '#92400e', padding: '4px 8px', borderRadius: '6px' }}>
                                                {order.status}
                                            </span>
                                            <span style={{ fontWeight: 700, marginTop: '4px' }}>₹{order.total}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.mode}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

        </main>
    );
}
