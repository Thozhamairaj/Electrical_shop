import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import './AdminDashboard.css';

const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#6366f1',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
};

export default function AdminDashboard() {
    const { authFetch } = useAdmin();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard`)
            .then(r => r.ok ? r.json() : Promise.reject('Failed to load'))
            .then(setStats)
            .catch(() => setError('Failed to load dashboard data.'))
            .finally(() => setLoading(false));
    }, [authFetch]);

    if (loading) return (
        <AdminLayout>
            <div className="ad-skeleton-wrap">
                {[...Array(4)].map((_, i) => <div key={i} className="ad-stat-skeleton" />)}
            </div>
        </AdminLayout>
    );

    if (error) return (
        <AdminLayout>
            <div className="ad-error">{error}</div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="ad-page">
                <div className="ad-page-title">
                    <h2>Dashboard Overview</h2>
                    <p>Welcome back! Here's what's happening with your store.</p>
                </div>

                {/* Stat cards */}
                <div className="ad-stats-grid">
                    <div className="ad-stat-card">
                        <div className="ad-stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                        </div>
                        <div>
                            <p className="ad-stat-label">Total Products</p>
                            <p className="ad-stat-value">{stats.productCount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="ad-stat-card">
                        <div className="ad-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                        </div>
                        <div>
                            <p className="ad-stat-label">Total Orders</p>
                            <p className="ad-stat-value">{stats.orderCount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="ad-stat-card">
                        <div className="ad-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                        </div>
                        <div>
                            <p className="ad-stat-label">Customers</p>
                            <p className="ad-stat-value">{stats.customerCount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="ad-stat-card">
                        <div className="ad-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                        </div>
                        <div>
                            <p className="ad-stat-label">Total Revenue</p>
                            <p className="ad-stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="ad-stat-card">
                        <div className="ad-stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div>
                            <p className="ad-stat-label">Low Stock Items</p>
                            <p className="ad-stat-value">{stats.lowStockProducts.length}</p>
                        </div>
                    </div>
                </div>

                <div className="ad-bottom-grid">
                    {/* Recent orders */}
                    <div className="ad-panel">
                        <div className="ad-panel-header">
                            <h3>Recent Orders</h3>
                            <a href="/admin/orders" className="ad-panel-link">View all →</a>
                        </div>
                        {stats.recentOrders.length === 0 ? (
                            <div className="ad-empty">No orders yet</div>
                        ) : (
                            <div className="ad-orders-list">
                                {stats.recentOrders.map(order => (
                                    <div key={order.id} className="ad-order-row">
                                        <div>
                                            <span className="ad-order-id">#{order.id}</span>
                                            <span className="ad-order-user">{order.userName || order.userEmail || 'Customer'}</span>
                                        </div>
                                        <div className="ad-order-right">
                                            <span className="ad-order-amount">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                                            <span
                                                className="ad-status-badge"
                                                style={{ color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] + '40', background: STATUS_COLORS[order.status] + '15' }}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Low stock */}
                    <div className="ad-panel">
                        <div className="ad-panel-header">
                            <h3>Low Stock Alert</h3>
                            <a href="/admin/products" className="ad-panel-link">Manage →</a>
                        </div>
                        {stats.lowStockProducts.length === 0 ? (
                            <div className="ad-empty ad-empty-green">✓ All products well stocked</div>
                        ) : (
                            <div className="ad-stock-list">
                                {stats.lowStockProducts.map(p => (
                                    <div key={p.id} className="ad-stock-row">
                                        <span className="ad-stock-name">{p.name}</span>
                                        <span className={`ad-stock-badge ${p.stock === 0 ? 'out' : 'low'}`}>
                                            {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
