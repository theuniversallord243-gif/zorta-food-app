"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
// We'll simulate fetching/saving specific to this outlet via local storage helper
// In a real app this would call API

export default function MenuTab({ outletId }) {
    const [items, setItems] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imageUploadStatus, setImageUploadStatus] = useState('');

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: 'Starters', // Default
        isVeg: true,
        description: '',
        image: '' // New Image Field
    });

    const categories = ['Starters', 'Main Course', 'Beverages', 'Desserts'];

    // Image compression function
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max width 1000px, maintain aspect ratio
                    if (width > 1000) {
                        height = (height * 1000) / width;
                        width = 1000;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    canvas.toBlob(
                        (blob) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(blob);
                            reader.onloadend = () => {
                                resolve(reader.result);
                            };
                        },
                        'image/jpeg',
                        0.7
                    );
                };
                img.onerror = () => reject(new Error('Failed to load image'));
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
        });
    };

    // Load items on mount
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch(`/api/menu?outletId=${outletId}`);
                const data = await res.json();
                setItems(data);
            } catch (err) {
                console.error('Failed to fetch menu', err);
            }
        };

        fetchItems();
    }, [outletId]);


    const addItem = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newItem,
                    outletId: outletId
                })
            });

            if (res.ok) {
                const savedItem = await res.json();
                setItems([...items, savedItem]);
                setShowAddForm(false);
                setNewItem({ name: '', price: '', category: 'Starters', isVeg: true, description: '', image: '' });
            }
        } catch (err) {
            console.error('Failed to add item', err);
        }
    };

    const deleteItem = async (id) => {
        if (confirm('Delete this item?')) {
            try {
                const res = await fetch(`/api/menu?id=${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    const updated = items.filter(i => i.id !== id);
                    setItems(updated);
                }
            } catch (err) {
                console.error('Failed to delete item', err);
            }
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setNewItem({
            name: item.name,
            price: item.price,
            category: item.category,
            isVeg: item.isVeg,
            description: item.description,
            image: item.image
        });
        setShowAddForm(false);
    };

    const updateItem = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/menu', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingId,
                    ...newItem
                })
            });

            if (res.ok) {
                const updatedItem = await res.json();
                const updated = items.map(i => i.id === editingId ? updatedItem : i);
                setItems(updated);
                setEditingId(null);
                setNewItem({ name: '', price: '', category: 'Starters', isVeg: true, description: '', image: '' });
            }
        } catch (err) {
            console.error('Failed to update item', err);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewItem({ name: '', price: '', category: 'Starters', isVeg: true, description: '', image: '' });
    };

    /* Group items by category for display */
    const groupedItems = categories.reduce((acc, cat) => {
        acc[cat] = items.filter(i => i.category === cat);
        return acc;
    }, {});

    return (
        <div className="flex-col p-4 w-full fade-in" style={{ paddingBottom: '100px' }}>

            {/* Add Button */}
            {!showAddForm && editingId === null && (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex-center gap-2 w-full p-4 mb-4"
                    style={{
                        background: 'var(--surface)',
                        border: '2px dashed var(--border)',
                        borderRadius: '0',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={20} /> Add New Item
                </button>
            )}

            {/* Add/Edit Item Form */}
            {(showAddForm || editingId !== null) && (
                <form onSubmit={editingId !== null ? updateItem : addItem} className="flex-col gap-3 mb-6 p-4" style={{ background: 'white', borderRadius: '0', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{editingId !== null ? 'Edit Item' : 'Add New Item'}</h3>

                    <input
                        required
                        type="text"
                        placeholder="Item Name (e.g. Paneer Tikka)"
                        className="p-3 w-full"
                        style={{ 
                            border: '2px solid var(--border)', 
                            borderRadius: '0',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            transition: 'border-color 0.2s',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                            required
                            type="number"
                            placeholder="Price (₹)"
                            className="p-3 w-full"
                            style={{ 
                                border: '2px solid var(--border)', 
                                borderRadius: '0',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                background: 'var(--surface)',
                                color: 'var(--text-main)',
                                transition: 'border-color 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            value={newItem.price}
                            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                        />
                        <select
                            className="p-3 w-full"
                            style={{ 
                                border: '2px solid var(--border)', 
                                borderRadius: '0',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                background: 'var(--surface)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            value={newItem.category}
                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    <textarea
                        placeholder="Item Description (e.g. Soft and creamy paneer in aromatic tomato gravy with butter and cream...)"
                        rows={2}
                        className="p-3 w-full"
                        style={{ 
                            border: '2px solid var(--border)', 
                            borderRadius: '0',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            resize: 'vertical',
                            minHeight: '60px',
                            transition: 'border-color 0.2s',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        value={newItem.description}
                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    />

                    <div className="flex-col gap-2">
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Item Image</label>
                        {newItem.image && (
                            <img src={newItem.image} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '0' }} />
                        )}
                        <label className="flex-center w-full p-3 gap-2" style={{ border: '2px dashed var(--border)', borderRadius: '0', cursor: 'pointer', background: '#f9fafb', transition: 'border-color 0.2s' }}>
                            <Upload size={16} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{newItem.image ? 'Change Image' : 'Click / Upload Image'}</span>
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        // File size validation (max 5MB)
                                        if (file.size > 5 * 1024 * 1024) {
                                            setImageUploadStatus('File too large! Max 5MB allowed.');
                                            setTimeout(() => setImageUploadStatus(''), 3000);
                                            return;
                                        }

                                        setImageUploadStatus('Compressing image...');
                                        try {
                                            const compressedImage = await compressImage(file);
                                            setNewItem({ ...newItem, image: compressedImage });
                                            setImageUploadStatus('');
                                        } catch (err) {
                                            console.error('Image compression failed:', err);
                                            setImageUploadStatus('Failed to process image. Try another.');
                                            setTimeout(() => setImageUploadStatus(''), 3000);
                                        }
                                    }
                                }}
                            />
                        </label>
                        {imageUploadStatus && (
                            <div style={{ fontSize: '0.8rem', color: imageUploadStatus.includes('Failed') ? '#ef4444' : '#10b981', fontWeight: 600, textAlign: 'center' }}>
                                {imageUploadStatus}
                            </div>
                        )}
                    </div>

                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginTop: '4px' }}>
                        <label className="flex-center gap-2" style={{ cursor: 'pointer' }}>
                            <input type="radio" checked={newItem.isVeg} onChange={() => setNewItem({ ...newItem, isVeg: true })} /> Veg
                        </label>
                        <label className="flex-center gap-2" style={{ cursor: 'pointer' }}>
                            <input type="radio" checked={!newItem.isVeg} onChange={() => setNewItem({ ...newItem, isVeg: false })} /> Non-Veg
                        </label>
                    </div>

                    <div className="flex-center gap-2 mt-2">
                        <button type="button" onClick={editingId !== null ? cancelEdit : () => setShowAddForm(false)} className="p-3 flex-1" style={{ background: 'white', border: '2px solid var(--border)', borderRadius: '0', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#f9fafb'} onMouseLeave={(e) => e.target.style.background = 'white'}>Cancel</button>
                        <button type="submit" className="p-3 flex-1" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0', cursor: 'pointer', fontWeight: 600 }}>{editingId !== null ? 'Update Item' : 'Save Item'}</button>
                    </div>
                </form>
            )}

            {/* Menu List */}
            <div className="flex-col gap-6">
                {Object.keys(groupedItems).map(cat => (
                    (groupedItems[cat].length > 0) && (
                        <div key={cat} className="flex-col gap-2">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>{cat}</h3>
                            {groupedItems[cat].map(item => (
                                <div key={item.id} className="flex-center" style={{ padding: '0.75rem', background: 'white', borderRadius: '0', justifyContent: 'flex-start', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', gap: '1rem' }}>
                                    {/* Image on Left */}
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0', flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: '100px', height: '100px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0', color: 'var(--text-muted)', flexShrink: 0, fontSize: '0.8rem', fontWeight: 600 }}>
                                            No Image
                                        </div>
                                    )}
                                    
                                    {/* Details in Middle */}
                                    <div className="flex-col" style={{ flex: 1, gap: '12px' }}>
                                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px' }}>
                                            <span style={{ fontSize: '10px', padding: '2px 4px', border: `1px solid ${item.isVeg ? 'green' : 'red'}`, color: item.isVeg ? 'green' : 'red', borderRadius: '4px' }}>●</span>
                                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</span>
                                        </div>
                                        {item.description && (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.3', margin: 0 }}>{item.description}</p>
                                        )}
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>₹{item.price}</span>
                                    </div>
                                    
                                    {/* Action Buttons on Right */}
                                    <div className="flex-center" style={{ gap: '0.5rem', flexShrink: 0 }}>
                                        <button onClick={() => startEdit(item)} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }} title="Edit item">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => deleteItem(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }} title="Delete item">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ))}
            </div>

            {items.length === 0 && !showAddForm && (
                <p className="text-center" style={{ color: 'var(--text-muted)', marginTop: '2rem' }}>No items added yet. Start by adding one!</p>
            )}
        </div>
    );
}
