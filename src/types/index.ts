export type ProductCategory = 'Burgers' | 'Pizza' | 'Pasta' | 'Sides' | 'Drinks';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: ProductCategory;
  sellingPrice: number;
  costPrice: number; // For admin profitability analytics
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
  isFeatured?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  costPrice?: number;
  quantity: number;
  imageUrl: string;
  category: ProductCategory;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid';

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  sellingPrice: number;
  costPrice: number; // Historical cost snapshot
  quantity: number;
  imageUrl: string;
  category: ProductCategory;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  updatedBy?: string;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'Credit / Debit Card (Stripe)';
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory?: OrderStatusHistory[];
}

export type ExpenseCategory =
  | 'Ingredients'
  | 'Utilities'
  | 'Salaries'
  | 'Rent'
  | 'Marketing'
  | 'Packaging'
  | 'Equipment'
  | 'Delivery'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  logoUrl?: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  deliveryFee: number;
  promoBannerText: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUser {
  userId: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}
