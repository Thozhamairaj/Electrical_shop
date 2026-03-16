import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import './AdminOrders.css';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#6366f1',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
};

export default function AdminOrders() {
    const { authFetch } = useAdmin();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadOrders = useCallback(() => {
        setLoading(true);
        authFetch('/api/orders')
            .then(r => r.ok ? r.json() : Promise.reject('Failed'))
            .then(setOrders)
            .catch(() => setError('Failed to load orders.'))
            .finally(() => setLoading(false));
    }, [authFetch]);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const res = await authFetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            showToast(`Order #${orderId} status updated to "${newStatus}"`);
        } catch {
            showToast('Failed to update status.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AdminLayout>
            <div className="ao-page">
                {toast && <div className={`ao-toast ${toast.type}`}>{toast.msg}</div>}

                <div className="ao-toolbar">
                    <div>
                        <h2 className="ao-heading">Orders</h2>
                        <p className="ao-subhead">{orders.length} total orders</p>
                    </div>
                    <div className="ao-filters">
                        <button
                            className={`ao-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            All ({orders.length})
                        </button>
                        {STATUS_OPTIONS.map(s => {
                            const count = orders.filter(o => o.status === s).length;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={s}
                                    className={`ao-filter-btn ${filterStatus === s ? 'active' : ''}`}
                                    style={filterStatus === s ? { borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s] } : {}}
                                    onClick={() => setFilterStatus(s)}
                                >
                                    {s} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="ao-loading">Loading orders…</div>
                ) : error ? (
                    <div className="ao-error">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="ao-empty-state">
                        <span className="ao-empty-icon">📋</span>
                        <p>No orders found</p>
                    </div>
                ) : (
                    <div className="ao-cards">
                        {filtered.map(order => (
                            <div key={order.id} className="ao-card">
                                <div
                                    className="ao-card-header"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                    <div className="ao-order-meta">
                                        <div className="ao-order-id-wrap">
                                            <span className="ao-order-number">Order #{order.id}</span>
                                            <span
                                                className="ao-status-chip"
                                                style={{
                                                    color: STATUS_COLORS[order.status],
                                                    background: STATUS_COLORS[order.status] + '18',
                                                    borderColor: STATUS_COLORS[order.status] + '40',
                                                }}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="ao-order-date">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="ao-order-summary">
                                        <div className="ao-order-customer">
                                            <span className="ao-customer-name">{order.userName || 'Unknown'}</span>
                                            <span className="ao-customer-email">{order.userEmail || ''}</span>
                                        </div>
                                        <span className="ao-order-total">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                                        <svg
                                            className={`ao-chevron ${expandedOrder === order.id ? 'open' : ''}`}
                                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        >
                                            <polyline points="6 9 12 15 18 9"/>
                                        </svg>
                                    </div>
                                </div>

                                {expandedOrder === order.id && (
                                    <div className="ao-card-body">
                                        {/* Items */}
                                        <div className="ao-section">
                                            <h4 className="ao-section-title">Items Ordered</h4>
                                            <div className="ao-items-list">
                                                {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items)?.map((item, i) => (
                                                    <div key={i} className="ao-item-row">
                                                        <span className="ao-item-name">{item.name}</span>
                                                        <span className="ao-item-qty">×{item.quantity}</span>
                                                        <span className="ao-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Customer info */}
                                        {(order.userPhone || order.shippingAddress) && (
                                            <div className="ao-section">
                                                <h4 className="ao-section-title">Customer Details</h4>
                                                {order.userPhone && <p className="ao-detail-row">📞 {order.userPhone}</p>}
                                                {order.shippingAddress && <p className="ao-detail-row">📍 {order.shippingAddress}</p>}
                                            </div>
                                        )}

                                        {/* Status changer */}
                                        <div className="ao-section ao-status-section">
                                            <h4 className="ao-section-title">Update Status</h4>
                                            <div className="ao-status-btns">
                                                {STATUS_OPTIONS.map(s => (
                                                    <button
                                                        key={s}
                                                        className={`ao-status-btn ${order.status === s ? 'current' : ''}`}
                                                        style={order.status === s ? { background: STATUS_COLORS[s] + '25', borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s] } : {}}
                                                        onClick={() => s !== order.status && handleStatusChange(order.id, s)}
                                                        disabled={updatingId === order.id}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
