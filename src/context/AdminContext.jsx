import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminContext = createContext(null);

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin`;

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
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
                    localStorage.removeItem('adminToken');
                    setToken(null);
                }
            })
            .catch(() => {
                localStorage.removeItem('adminToken');
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
        console.log('Login response:', data);
        
        if (!res.ok) throw new Error(data.error || 'Login failed');
        
        const tokenToSave = data.token || (data.data && data.data.token);
        if (tokenToSave) {
            localStorage.setItem('adminToken', tokenToSave);
            setToken(tokenToSave);
            setAdmin(data.admin || (data.data && data.data.admin));
        } else {
            console.error('No token found in login response');
        }
        return data.admin;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('adminToken');
        setToken(null);
        setAdmin(null);
    }, []);

    const authFetch = useCallback(async (url, options = {}) => {
        if (!token) {
            console.warn(`authFetch: Attempted to fetch ${url} without admin token`);
        }
        
        // Ensure relative URLs are prefixed with API base if needed, 
        // but here we assume the proxy handles it or the caller provides the full path.
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
