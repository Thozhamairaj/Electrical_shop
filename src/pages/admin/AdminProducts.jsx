import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import './AdminProducts.css';

const EMPTY_FORM = {
    name: '', price: '', originalPrice: '', description: '',
    image: '', category: '', rating: '', reviews: '', stock: '',
};

export default function AdminProducts() {
    const { authFetch } = useAdmin();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadProducts = useCallback(() => {
        setLoading(true);
        authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin-products`)
            .then(r => r.ok ? r.json() : Promise.reject('Failed'))
            .then(setProducts)
            .catch(() => setError('Failed to load products.'))
            .finally(() => setLoading(false));
    }, [authFetch]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const openAdd = () => {
        setEditingProduct(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditingProduct(p);
        setForm({
            name: p.name || '',
            price: p.price ?? '',
            originalPrice: p.originalPrice ?? '',
            description: p.description || '',
            image: p.image || '',
            category: p.category || '',
            rating: p.rating ?? '',
            reviews: p.reviews ?? '',
            stock: p.stock ?? '',
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price),
                originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
                rating: form.rating ? parseFloat(form.rating) : null,
                reviews: form.reviews ? parseInt(form.reviews) : 0,
                stock: form.stock ? parseInt(form.stock) : 0,
            };

            const url = editingProduct
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin-products/${editingProduct.id}`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin-products`;
            const method = editingProduct ? 'PUT' : 'POST';

            const res = await authFetch(url, { method, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error('Save failed');

            setShowModal(false);
            loadProducts();
            showToast(editingProduct ? 'Product updated!' : 'Product created!');
        } catch {
            showToast('Failed to save product.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin-products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setDeleteConfirm(null);
            loadProducts();
            showToast('Product deleted.');
        } catch {
            showToast('Failed to delete product.', 'error');
        }
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="ap-page">
                {toast && (
                    <div className={`ap-toast ${toast.type}`}>{toast.msg}</div>
                )}

                <div className="ap-toolbar">
                    <div>
                        <h2 className="ap-heading">Products</h2>
                        <p className="ap-subhead">{products.length} products in catalog</p>
                    </div>
                    <div className="ap-toolbar-right">
                        <div className="ap-search-wrap">
                            <svg className="ap-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input
                                type="text"
                                className="ap-search"
                                placeholder="Search products..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="ap-add-btn" onClick={openAdd} id="admin-add-product">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Product
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="ap-loading">Loading products…</div>
                ) : error ? (
                    <div className="ap-error">{error}</div>
                ) : (
                    <div className="ap-table-wrap">
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="6" className="ap-empty">No products found.</td></tr>
                                ) : filtered.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="ap-product-cell">
                                                {p.image ? (
                                                    <img src={p.image} alt={p.name} className="ap-thumb" onError={e => { e.target.style.display='none'; }} />
                                                ) : (
                                                    <div className="ap-thumb-placeholder">⚡</div>
                                                )}
                                                <div>
                                                    <p className="ap-product-name">{p.name}</p>
                                                    <p className="ap-product-id">ID: {p.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="ap-category-tag">{p.category || '—'}</span></td>
                                        <td>
                                            <div>
                                                <p className="ap-price">₹{p.price?.toLocaleString()}</p>
                                                {p.originalPrice && <p className="ap-original-price">₹{p.originalPrice?.toLocaleString()}</p>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`ap-stock-badge ${p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'ok'}`}>
                                                {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                                            </span>
                                        </td>
                                        <td>
                                            {p.rating ? (
                                                <span className="ap-rating">⭐ {p.rating}</span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            <div className="ap-actions">
                                                <button className="ap-edit-btn" onClick={() => openEdit(p)} title="Edit">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </button>
                                                <button className="ap-delete-btn" onClick={() => setDeleteConfirm(p)} title="Delete">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="ap-modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="ap-modal" onClick={e => e.stopPropagation()}>
                            <div className="ap-modal-header">
                                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                <button className="ap-modal-close" onClick={() => setShowModal(false)}>✕</button>
                            </div>
                            <form className="ap-form" onSubmit={handleSave}>
                                <div className="ap-form-grid">
                                    <div className="ap-form-field ap-full">
                                        <label>Product Name *</label>
                                        <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. LED Bulb 9W" />
                                    </div>
                                    <div className="ap-form-field">
                                        <label>Price (₹) *</label>
                                        <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="299" />
                                    </div>
                                    <div className="ap-form-field">
                                        <label>Original Price (₹)</label>
                                        <input type="number" step="0.01" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})} placeholder="399" />
                                    </div>
                                    <div className="ap-form-field">
                                        <label>Category</label>
                                        <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="lighting" />
                                    </div>
                                    <div className="ap-form-field">
                                        <label>Stock</label>
                                        <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="100" />
                                    </div>
                                    <div className="ap-form-field">
                                        <label>Rating (0–5)</label>
                                        <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} placeholder="4.5" />
                                    </div>
                                    <div className="ap-form-field">
                                        <label>Reviews Count</label>
                                        <input type="number" value={form.reviews} onChange={e => setForm({...form, reviews: e.target.value})} placeholder="0" />
                                    </div>
                                    <div className="ap-form-field ap-full">
                                        <label>Image URL</label>
                                        <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://example.com/image.jpg" />
                                    </div>
                                    <div className="ap-form-field ap-full">
                                        <label>Description</label>
                                        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" placeholder="Product description..." />
                                    </div>
                                </div>
                                <div className="ap-form-actions">
                                    <button type="button" className="ap-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="ap-save-btn" disabled={saving} id="admin-save-product">
                                        {saving ? 'Saving…' : editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete confirmation */}
                {deleteConfirm && (
                    <div className="ap-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                        <div className="ap-confirm-modal" onClick={e => e.stopPropagation()}>
                            <div className="ap-confirm-icon">🗑️</div>
                            <h3>Delete Product?</h3>
                            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
                            <div className="ap-confirm-actions">
                                <button className="ap-cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button className="ap-delete-confirm-btn" onClick={() => handleDelete(deleteConfirm.id)} id="admin-confirm-delete">
                                    Delete Product
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
