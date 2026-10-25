import React, { useEffect, useState } from 'react';
import {
  User,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  LogOut,
  RefreshCw,
  PackageCheck,
  ShieldCheck,
  Receipt,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { subscribeToCustomerOrders } from '../services/dbService';
import { Order, OrderStatus } from '../types';

interface CustomerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, isEmailVerified, signOutUser, sendVerificationEmail, refreshEmailVerification, updateCustomerProfile } = useAuth();
  const { itemCount, total: cartTotal } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile?.displayName || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editAddress, setEditAddress] = useState(userProfile?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Subscribe to real-time customer orders
  useEffect(() => {
    if (!currentUser) return;
    setLoadingOrders(true);
    const unsubscribe = subscribeToCustomerOrders(currentUser.uid, (data) => {
      setOrders(data);
      setLoadingOrders(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900">
          Sign In to Access Your Dashboard
        </h2>
        <p className="text-sm text-stone-600">
          Track active orders, manage your delivery address, and view your meal history.
        </p>
        <button
          onClick={() => onNavigate('signin')}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm shadow-md"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateCustomerProfile({
        displayName: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
      setIsEditingProfile(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Order Received
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'preparing':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Kitchen
          </span>
        );
      case 'ready':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Pickup
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1.5 animate-pulse">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 bg-orange-100/70 px-3 py-1 rounded-full inline-block mb-1.5">
            Customer Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
            Welcome back, {userProfile?.displayName || currentUser.displayName || 'Foodie'}!
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage your account settings, active deliveries, and past orders.
          </p>
        </div>

        <button
          onClick={async () => {
            await signOutUser();
            onNavigate('home');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:text-rose-600 hover:border-rose-300 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <button
              onClick={() => {
                setEditName(userProfile?.displayName || '');
                setEditPhone(userProfile?.phone || '');
                setEditAddress(userProfile?.address || '');
                setIsEditingProfile(!isEditingProfile);
              }}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="space-y-2 text-sm text-stone-600">
              <p className="font-bold text-stone-900 text-base">
                {userProfile?.displayName || currentUser.displayName || 'No name set'}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{userProfile?.phone || 'No phone saved'}</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{userProfile?.address || 'No default address saved'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase">Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700"
              >
                {savingProfile ? 'Saving...' : 'Save Updates'}
              </button>
            </form>
          )}
        </div>

        {/* Email Verification Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {isEmailVerified ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Verified Account
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  Pending Verification
                </span>
              )}
            </div>

            <h3 className="font-bold text-stone-900 text-base">Security & Verification</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {isEmailVerified
                ? 'Your email address is verified. You have full access to place orders with Cash on Delivery.'
                : 'Please verify your email address to enable fast, secure order submission.'}
            </p>
          </div>

          {!isEmailVerified && (
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <button
                onClick={async () => {
                  setResendingVerification(true);
                  try {
                    await sendVerificationEmail();
                    setResendSuccess(true);
                    setTimeout(() => setResendSuccess(false), 5000);
                  } catch (e: any) {
                    alert(e.message || 'Could not send verification email');
                  } finally {
                    setResendingVerification(false);
                  }
                }}
                disabled={resendingVerification}
                className="w-full py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
              >
                {resendingVerification ? 'Sending...' : 'Resend Verification Link'}
              </button>
              {resendSuccess && (
                <p className="text-[11px] text-emerald-700 font-semibold text-center">
                  Link sent! Check your inbox.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Saved Cart Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-stone-500">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            <h3 className="font-bold text-stone-900 text-base">Saved Cloud Cart</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {itemCount > 0
                ? `You have €${cartTotal.toFixed(2)} worth of food waiting in your persistent shopping cart.`
                : 'Your cart is currently empty. Explore our tasty menu!'}
            </p>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button
              onClick={() => onNavigate(itemCount > 0 ? 'cart' : 'menu')}
              className="w-full py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
            >
              {itemCount > 0 ? 'View & Checkout Cart' : 'Browse Food Menu'}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-600" />
            <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900">
              Order History & Tracking
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-semibold">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Placed
          </span>
        </div>

        {loadingOrders ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading your order history from Firestore...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-['Playfair_Display',serif] text-stone-900">
              No orders placed yet
            </h3>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              When you order from Savory Bite, you can track the chef preparation and delivery driver in real-time right here!
            </p>
            <button
              onClick={() => onNavigate('menu')}
              className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md"
            >
              Order Your First Meal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden transition-all hover:border-orange-200"
                >
                  {/* Order Summary Row */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none hover:bg-stone-50/70"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-base text-stone-900 font-mono">
                          #{order.id}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-stone-400">Placed on {formattedDate}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-stone-500 block">Total ({order.items.length} items)</span>
                        <span className="font-extrabold text-lg text-stone-900">
                          €{order.total.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-amber-700 font-semibold uppercase">
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </div>

                      <button
                        className="p-2 rounded-xl text-stone-400 hover:text-stone-700 bg-stone-100"
                        aria-label="Expand order details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {isExpanded && (
                    <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-stone-100 bg-stone-50/50 space-y-6">
                      {/* Dishes List */}
                      <div>
                        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                          Ordered Items
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-white p-3 rounded-2xl border border-stone-200/60 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80';
                                  }}
                                />
                                <div>
                                  <span className="font-bold text-stone-900 block">{item.name}</span>
                                  <span className="text-stone-400">
                                    Qty: {item.quantity} × €{item.sellingPrice.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold text-stone-900">
                                €{(item.sellingPrice * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address & Status History */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-white p-4 rounded-2xl border border-stone-200/60 space-y-2">
                          <p className="font-bold text-stone-800 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                            <span>Delivery Destination</span>
                          </p>
                          <p className="text-stone-600">{order.deliveryAddress}</p>
                          <p className="text-stone-500">Contact: {order.customerPhone}</p>
                          {order.deliveryInstructions && (
                            <p className="text-stone-500 italic mt-1">
                              Note: {order.deliveryInstructions}
                            </p>
                          )}
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-stone-200/60 space-y-2">
                          <p className="font-bold text-stone-800 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                            <span>Order Status Timeline</span>
                          </p>
                          <div className="space-y-1.5 pt-1">
                            {order.statusHistory?.map((h, i) => (
                              <div key={i} className="flex justify-between text-[11px] text-stone-600">
                                <span className="font-semibold capitalize text-stone-800">
                                  {h.status.replace('_', ' ')}: {h.note}
                                </span>
                                <span className="text-stone-400">
                                  {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
