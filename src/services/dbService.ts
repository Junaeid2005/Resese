import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  MenuItem,
  CartItem,
  Order,
  OrderItemSnapshot,
  OrderStatus,
  PaymentStatus,
  Expense,
  RestaurantSettings,
  UserProfile,
} from '../types';
import { INITIAL_MENU_ITEMS, DEFAULT_RESTAURANT_SETTINGS } from '../data/initialData';

// Bootstrapped admin email
export const BOOTSTRAP_ADMIN_EMAIL = 'junaeidshohan@gmail.com';

// -------------------------------------------------------------
// Seeding & Initialization
// -------------------------------------------------------------
export async function seedInitialDataIfEmpty(): Promise<void> {
  const menuPath = 'menuItems';
  try {
    const snapshot = await getDocs(collection(db, menuPath));
    if (snapshot.empty) {
      console.log('Seeding initial menu items to Firestore...');
      for (const item of INITIAL_MENU_ITEMS) {
        await setDoc(doc(db, menuPath, item.id), item);
      }
    }
  } catch (error) {
    // If permission or error occurs during read/seed, handle gracefully
    console.warn('Initial menu check/seed note:', error);
  }

  const settingsPath = 'restaurantSettings';
  try {
    const settingsDoc = await getDoc(doc(db, settingsPath, 'general'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, settingsPath, 'general'), DEFAULT_RESTAURANT_SETTINGS);
    }
  } catch (error) {
    console.warn('Initial settings check/seed note:', error);
  }
}

// -------------------------------------------------------------
// Admin Role Verification
// -------------------------------------------------------------
export async function verifyUserAdminStatus(user: { uid: string; email?: string | null } | null): Promise<boolean> {
  if (!user || !user.email) return false;
  if (user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
    // Seed admin record to Firestore /admins collection if not yet present
    try {
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminDocRef);
      if (!adminSnap.exists()) {
        await setDoc(adminDocRef, {
          userId: user.uid,
          email: user.email,
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Even if firestore write fails, bootstrap check confirms admin status
    }
    return true;
  }

  const adminPath = `admins/${user.uid}`;
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch (error) {
    console.warn('Failed admin role check:', error);
    return false;
  }
}

// -------------------------------------------------------------
// Menu Catalog
// -------------------------------------------------------------
export function subscribeToMenuItems(
  onData: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'menuItems';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as MenuItem), id: docSnap.id });
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt'>): Promise<string> {
  const path = 'menuItems';
  const newId = `item-${Date.now()}`;
  const now = new Date().toISOString();
  const newItem: MenuItem = {
    ...item,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };
  try {
    await setDoc(doc(db, path, newId), newItem);
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
  const path = `menuItems/${id}`;
  try {
    await updateDoc(doc(db, 'menuItems', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const path = `menuItems/${id}`;
  try {
    await deleteDoc(doc(db, 'menuItems', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Cart Persistence (User-Isolated in Firestore)
// -------------------------------------------------------------
export async function getFirestoreCart(userId: string): Promise<CartItem[]> {
  const path = `carts/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'carts', userId));
    if (docSnap.exists()) {
      return (docSnap.data().items as CartItem[]) || [];
    }
    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveFirestoreCart(userId: string, items: CartItem[]): Promise<void> {
  const path = `carts/${userId}`;
  try {
    await setDoc(doc(db, 'carts', userId), {
      userId,
      items,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToFirestoreCart(
  userId: string,
  onData: (items: CartItem[]) => void
): Unsubscribe {
  const path = `carts/${userId}`;
  return onSnapshot(
    doc(db, 'carts', userId),
    (docSnap) => {
      if (docSnap.exists()) {
        onData((docSnap.data().items as CartItem[]) || []);
      } else {
        onData([]);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// -------------------------------------------------------------
// Orders (Authoritative Validation & Snapshot Creation)
// -------------------------------------------------------------
export interface CreateOrderParams {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  items: CartItem[];
  deliveryFee: number;
}

export async function placeCustomerOrder(params: CreateOrderParams): Promise<Order> {
  const orderPath = 'orders';
  const cartPath = `carts/${params.customerId}`;

  if (!params.items || params.items.length === 0) {
    throw new Error('Your cart is empty. Please select food items before placing an order.');
  }

  // Authoritative price check against live menu catalog in database
  let catalogMap = new Map<string, MenuItem>();
  try {
    const menuSnaps = await getDocs(collection(db, 'menuItems'));
    menuSnaps.forEach((docSnap) => {
      catalogMap.set(docSnap.id, docSnap.data() as MenuItem);
    });
  } catch (err) {
    console.warn('Could not read menu catalog for live re-verification:', err);
  }

  // Recalculate totals authoritatively
  let computedSubtotal = 0;
  const orderSnapshots: OrderItemSnapshot[] = [];

  for (const item of params.items) {
    const catalogItem = catalogMap.get(item.productId);
    // If catalog item exists in db, strictly use its DB price; fallback to item price
    const unitPrice = catalogItem ? catalogItem.sellingPrice : item.price;
    const unitCost = catalogItem ? catalogItem.costPrice : (item.costPrice || Number((unitPrice * 0.35).toFixed(2)));
    const quantity = Math.max(1, Math.floor(item.quantity));

    computedSubtotal += unitPrice * quantity;
    orderSnapshots.push({
      productId: item.productId,
      name: catalogItem?.name || item.name,
      sellingPrice: unitPrice,
      costPrice: unitCost,
      quantity,
      imageUrl: catalogItem?.imageUrl || item.imageUrl,
      category: catalogItem?.category || item.category,
    });
  }

  computedSubtotal = Number(computedSubtotal.toFixed(2));
  const finalDeliveryFee = Number(params.deliveryFee.toFixed(2));
  const computedTotal = Number((computedSubtotal + finalDeliveryFee).toFixed(2));

  const orderId = `SB-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    customerId: params.customerId,
    customerName: params.customerName.trim(),
    customerEmail: params.customerEmail.trim(),
    customerPhone: params.customerPhone.trim(),
    deliveryAddress: params.deliveryAddress.trim(),
    deliveryInstructions: params.deliveryInstructions?.trim() || '',
    items: orderSnapshots,
    subtotal: computedSubtotal,
    deliveryFee: finalDeliveryFee,
    total: computedTotal,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'unpaid',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    statusHistory: [
      {
        status: 'pending',
        timestamp: now,
        note: 'Order submitted with Cash on Delivery',
      },
    ],
  };

  try {
    // 1. Save order document
    await setDoc(doc(db, orderPath, orderId), newOrder);

    // 2. Clear customer's persistent cart only after order success
    try {
      await setDoc(doc(db, 'carts', params.customerId), {
        userId: params.customerId,
        items: [],
        updatedAt: now,
      });
    } catch (cartErr) {
      console.warn('Note: Cart clear after order faced error:', cartErr);
    }

    return newOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, orderPath);
  }
}

export function subscribeToCustomerOrders(
  customerId: string,
  onData: (orders: Order[]) => void
): Unsubscribe {
  const path = 'orders';
  const q = query(
    collection(db, path),
    where('customerId', '==', customerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Order);
      });
      // Sort in memory by createdAt descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToAllOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Order);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error) => {
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  paymentStatus?: PaymentStatus,
  note?: string,
  updatedBy?: string
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderDocRef);
    if (!orderSnap.exists()) throw new Error('Order not found');

    const currentOrder = orderSnap.data() as Order;
    const now = new Date().toISOString();
    const history = currentOrder.statusHistory || [];
    history.push({
      status: newStatus,
      timestamp: now,
      note: note || `Status changed to ${newStatus}`,
      updatedBy: updatedBy || 'Restaurant Admin',
    });

    const updates: Partial<Order> = {
      status: newStatus,
      updatedAt: now,
      statusHistory: history,
    };

    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    } else if (newStatus === 'delivered' && currentOrder.paymentStatus === 'unpaid') {
      // Cash collected on delivery
      updates.paymentStatus = 'paid';
    }

    await updateDoc(orderDocRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------
// Operating Expenses (Admin Only)
// -------------------------------------------------------------
export function subscribeToExpenses(
  onData: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'expenses';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Expense), id: docSnap.id });
      });
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(list);
    },
    (error) => {
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<string> {
  const path = 'expenses';
  const id = `exp-${Date.now()}`;
  const record: Expense = {
    ...expense,
    id,
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, path, id), record);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const path = `expenses/${id}`;
  try {
    await deleteDoc(doc(db, 'expenses', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Restaurant Settings
// -------------------------------------------------------------
export function subscribeToRestaurantSettings(
  onData: (settings: RestaurantSettings) => void
): Unsubscribe {
  const path = 'restaurantSettings/general';
  return onSnapshot(
    doc(db, 'restaurantSettings', 'general'),
    (docSnap) => {
      if (docSnap.exists()) {
        onData(docSnap.data() as RestaurantSettings);
      } else {
        onData(DEFAULT_RESTAURANT_SETTINGS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateRestaurantSettings(settings: RestaurantSettings): Promise<void> {
  const path = 'restaurantSettings/general';
  try {
    await setDoc(doc(db, 'restaurantSettings', 'general'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// Customer Profile Storage
// -------------------------------------------------------------
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: Partial<UserProfile> & { userId: string }): Promise<void> {
  const path = `users/${profile.userId}`;
  try {
    const ref = doc(db, 'users', profile.userId);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        ...profile,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(ref, {
        ...profile,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
