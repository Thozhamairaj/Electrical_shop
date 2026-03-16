import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

const CartContext = createContext(null);

// ── API helpers ────────────────────────────────────────────────────
async function fetchCartFromDB(userId) {
    try {
        const res = await fetch(`/api/cart/${userId}`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        return data.items ?? [];
    } catch {
        return null; // signal failure → fall back to localStorage
    }
}

async function saveCartToDB(userId, items, userEmail, userName) {
    try {
        await fetch(`/api/cart/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, userEmail, userName }),
        });
    } catch (err) {
        console.warn('Cart sync to DB failed:', err);
    }
}

async function clearCartInDB(userId) {
    try {
        await fetch(`/api/cart/${userId}`, { method: 'DELETE' });
    } catch (err) {
        console.warn('Cart clear in MongoDB failed:', err);
    }
}

// ── Provider ───────────────────────────────────────────────────────
export function CartProvider({ children }) {
    const { userId } = useAuth();
    const { user } = useUser();
    const guestKey = 'cart_guest';

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Track previous userId to detect real changes
    const prevUserId = useRef(null);

    // Load cart whenever the user identity changes
    useEffect(() => {
        if (prevUserId.current === userId) return;
        prevUserId.current = userId;

        if (userId) {
            // Signed-in user → load from MongoDB
            setLoading(true);
            fetchCartFromDB(userId).then((items) => {
                if (items !== null) {
                    setCartItems(items);
                    // Clear cached guest cart now that we have the real one
                    localStorage.removeItem(guestKey);
                } else {
                    // MongoDB unreachable — fall back to localStorage
                    const stored = localStorage.getItem(`cart_${userId}`);
                    setCartItems(stored ? JSON.parse(stored) : []);
                }
                setLoading(false);
            });
        } else {
            // Guest → load from localStorage
            const stored = localStorage.getItem(guestKey);
            setCartItems(stored ? JSON.parse(stored) : []);
        }
    }, [userId]);

    // Persist cart on every change
    const syncTimeoutRef = useRef(null);
    useEffect(() => {
        if (loading) return; // don't overwrite while loading

        if (userId) {
            // Debounce DB writes (300 ms) to avoid hammering the server on
            // rapid quantity changes
            clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
                const userEmail = user?.primaryEmailAddress?.emailAddress || null;
                const userName = user?.fullName || user?.firstName || null;
                saveCartToDB(userId, cartItems, userEmail, userName);
            }, 300);
        } else {
            // Guest → localStorage
            localStorage.setItem(guestKey, JSON.stringify(cartItems));
        }

        return () => clearTimeout(syncTimeoutRef.current);
    }, [cartItems, userId, loading]);

    // ── Actions ──────────────────────────────────────────────────
    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) { removeFromCart(productId); return; }
        setCartItems(prev =>
            prev.map(item => item.id === productId ? { ...item, quantity } : item)
        );
    };

    const clearCart = () => {
        setCartItems([]);
        if (userId) clearCartInDB(userId);
        else localStorage.removeItem(guestKey);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, cartCount, cartTotal, loading,
            addToCart, removeFromCart, updateQuantity, clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
}
