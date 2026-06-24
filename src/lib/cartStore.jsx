import { useState, useEffect, useCallback, createContext, useContext } from "react";

const CartContext = createContext(null);

const CART_KEY = "tiligo_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : { items: [], businessId: null, businessName: "" };
  } catch { return { items: [], businessId: null, businessName: "" }; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => { saveCart(cart); }, [cart]);

  const addItem = useCallback((product, business) => {
    setCart(prev => {
      if (prev.businessId && prev.businessId !== business.id) {
        if (!window.confirm("Shporta ka produkte nga një biznes tjetër. Dëshiron ta pastrosh?")) return prev;
        return { items: [{ ...product, quantity: 1 }], businessId: business.id, businessName: business.name };
      }
      const existing = prev.items.find(i => i.id === product.id);
      if (existing) {
        return { ...prev, items: prev.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { ...prev, items: [...prev.items, { ...product, quantity: 1 }], businessId: business.id, businessName: business.name };
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setCart(prev => {
      const newItems = prev.items.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
      if (newItems.length === 0) return { items: [], businessId: null, businessName: "" };
      return { ...prev, items: newItems };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [], businessId: null, businessName: "" });
  }, []);

  const getItemCount = useCallback(() => cart.items.reduce((a, i) => a + i.quantity, 0), [cart]);
  const getTotal = useCallback(() => cart.items.reduce((a, i) => a + i.price * i.quantity, 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, getItemCount, getTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}