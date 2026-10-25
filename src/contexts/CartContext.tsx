import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { CartItem, MenuItem } from '../types';
import { useAuth } from './AuthContext';
import { getFirestoreCart, saveFirestoreCart, subscribeToFirestoreCart } from '../services/dbService';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  loadingCart: boolean;
  addToCart: (item: MenuItem | CartItem, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setDeliveryFeeRate: (fee: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_CART_STORAGE_KEY = 'savory_bite_guest_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(2.50);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);

  // Guard against overwriting remote cart during initial load
  const isHydratedRef = useRef<boolean>(false);
  const previousUserIdRef = useRef<string | null>(null);

  // Load / Synchronize cart when auth state changes
  useEffect(() => {
    if (authLoading) return;

    if (currentUser) {
      // Authenticated User Flow
      const userId = currentUser.uid;
      setLoadingCart(true);

      // Check if there are temporary guest items to merge
      let guestItems: CartItem[] = [];
      try {
        const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (stored) {
          guestItems = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Could not parse guest cart:', e);
      }

      // First fetch Firestore cart
      getFirestoreCart(userId)
        .then((remoteCart) => {
          let merged = [...(remoteCart || [])];

          // Safe merge guest cart if any
          if (guestItems.length > 0) {
            for (const guestItem of guestItems) {
              const existingIndex = merged.findIndex((i) => i.productId === guestItem.productId);
              if (existingIndex > -1) {
                merged[existingIndex].quantity += guestItem.quantity;
              } else {
                merged.push(guestItem);
              }
            }
            // Clear temporary guest storage once merged
            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
            // Save merged result to Firestore
            saveFirestoreCart(userId, merged);
          }

          setItems(merged);
          isHydratedRef.current = true;
          setLoadingCart(false);
        })
        .catch((err) => {
          console.warn('Error fetching Firestore cart:', err);
          setLoadingCart(false);
          isHydratedRef.current = true;
        });

      // Real-time listener for multi-device sync
      const unsubscribe = subscribeToFirestoreCart(userId, (remoteItems) => {
        if (isHydratedRef.current) {
          setItems(remoteItems);
        }
      });

      previousUserIdRef.current = userId;
      return () => unsubscribe();
    } else {
      // Guest User Flow
      try {
        const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored));
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      }
      isHydratedRef.current = true;
      setLoadingCart(false);
      previousUserIdRef.current = null;
    }
  }, [currentUser, authLoading]);

  // Helper to persist current state
  const persistCart = (updatedItems: CartItem[]) => {
    setItems(updatedItems);
    if (currentUser && isHydratedRef.current) {
      saveFirestoreCart(currentUser.uid, updatedItems);
    } else if (!currentUser) {
      try {
        localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (e) {
        console.warn('Error saving guest cart to localStorage:', e);
      }
    }
  };

  const addToCart = (product: MenuItem | CartItem, quantity: number = 1) => {
    const qtyToAdd = Math.max(1, quantity);
    const existingIndex = items.findIndex((i) => i.productId === (('id' in product) ? product.id : product.productId));

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + qtyToAdd,
      };
    } else {
      const isMenuItem = 'id' in product;
      const newItem: CartItem = {
        productId: isMenuItem ? product.id : product.productId,
        name: product.name,
        price: isMenuItem ? product.sellingPrice : product.price,
        costPrice: isMenuItem ? product.costPrice : product.costPrice,
        quantity: qtyToAdd,
        imageUrl: product.imageUrl,
        category: product.category,
      };
      updated = [...items, newItem];
    }
    persistCart(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = items.map((i) =>
      i.productId === productId ? { ...i, quantity: Math.floor(quantity) } : i
    );
    persistCart(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = items.filter((i) => i.productId !== productId);
    persistCart(updated);
  };

  const clearCart = () => {
    persistCart([]);
  };

  const setDeliveryFeeRate = (fee: number) => {
    setDeliveryFee(fee);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const total = Number((subtotal > 0 ? subtotal + deliveryFee : 0).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        loadingCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setDeliveryFeeRate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
