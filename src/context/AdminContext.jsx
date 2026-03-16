import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminContext = createContext(null);

const API = '/api/admin';

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
    const [loading, setLoading] = useState(true);

    // Verify token on mount
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        fetch(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data) setAdmin(data);
                else {
                    // Token invalid — clear it
                    localStorage.removeItem('admin_token');
                    setToken(null);
                }
            })
            .catch(() => {
                localStorage.removeItem('admin_token');
                setToken(null);
            })
            .finally(() => setLoading(false));
    }, [token]);

    const login = useCallback(async (username, password) => {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setAdmin(data.admin);
        return data.admin;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setAdmin(null);
    }, []);

    const authFetch = useCallback(async (url, options = {}) => {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
        });
        return res;
    }, [token]);

    return (
        <AdminContext.Provider value={{ admin, token, loading, login, logout, authFetch }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
    return ctx;
}
