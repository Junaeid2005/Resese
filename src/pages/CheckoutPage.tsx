import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Mail,
  UtensilsCrossed,
  CreditCard,
  Lock,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { placeCustomerOrder } from '../services/dbService';
import { Order } from '../types';
import { StripeCardForm } from '../components/StripeCardForm';

const getStripePromise = () => {
  const envKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;
  if (envKey) return loadStripe(envKey);

  return fetch('/api/stripe-publishable-key')
    .then((res) => (res.ok ? res.json() : { publishableKey: '' }))
    .then((data) => {
      if (data.publishableKey) {
        return loadStripe(data.publishableKey);
      }
      return null;
    })
    .catch(() => null);
};

const stripePromise = getStripePromise();

interface CheckoutPageProps {
  onNavigate: (tab: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const {
    currentUser,
    userProfile,
    isEmailVerified,
    sendVerificationEmail,
    refreshEmailVerification,
    updateCustomerProfile,
  } = useAuth();
  const { items, subtotal, deliveryFee, total } = useCart();

  const [customerName, setCustomerName] = useState(
    userProfile?.displayName || currentUser?.displayName || ''
  );
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile?.address || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');

  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // If user is not authenticated
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900">
          Sign In Required
        </h2>
        <p className="text-sm text-stone-600">
          Please sign in or create an account to securely finalize your delivery order.
        </p>
        <button
          onClick={() => onNavigate('signin')}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm shadow-md"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // If cart is empty and no order just placed
  if (items.length === 0 && !placedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-stone-600">
          Add some delicious food to your order before heading to checkout.
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    const verified = await refreshEmailVerification();
    setCheckingVerification(false);
    if (!verified) {
      alert('Your email is not verified yet. Please click the link sent to your inbox.');
    }
  };

  const handleResendLink = async () => {
    try {
      setResendingEmail(true);
      await sendVerificationEmail();
      setEmailSentNotice(true);
      setTimeout(() => setEmailSentNotice(false), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to send verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  // Validate fields before submission
  const validateForm = () => {
    if (!isEmailVerified) {
      setOrderError('You must verify your email address before placing an order.');
      return false;
    }
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setOrderError('Please complete all required fields (Name, Phone, and Delivery Address).');
      return false;
    }
    return true;
  };

  // Cash on Delivery Submit
  const handleCODSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (saveAsDefault) {
        await updateCustomerProfile({
          displayName: customerName.trim(),
          phone: customerPhone.trim(),
          address: deliveryAddress.trim(),
        });
      }

      const order = await placeCustomerOrder({
        customerId: currentUser.uid,
        customerName: customerName.trim(),
        customerEmail: currentUser.email || '',
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryInstructions: deliveryInstructions.trim(),
        items,
        deliveryFee,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'unpaid',
      });

      setPlacedOrder(order);
    } catch (err: any) {
      console.error('Order submission error:', err);
      setOrderError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stripe Card Payment Success
  const handleStripeSuccess = async (paymentIntentId: string) => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (saveAsDefault) {
        await updateCustomerProfile({
          displayName: customerName.trim(),
          phone: customerPhone.trim(),
          address: deliveryAddress.trim(),
        });
      }

      const order = await placeCustomerOrder({
        customerId: currentUser.uid,
        customerName: customerName.trim(),
        customerEmail: currentUser.email || '',
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryInstructions: deliveryInstructions.trim(),
        items,
        deliveryFee,
        paymentMethod: 'Credit / Debit Card (Stripe)',
        paymentStatus: 'paid',
        stripePaymentIntentId: paymentIntentId,
      });

      setPlacedOrder(order);
    } catch (err: any) {
      console.error('Error saving paid order:', err);
      setOrderError(err.message || 'Payment succeeded, but recording order failed. Please contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  // Order Confirmation View
  if (placedOrder) {
    const isPaidOnline = placedOrder.paymentStatus === 'paid';
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              {isPaidOnline ? 'Payment & Order Confirmed' : 'Order Received Successfully'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
              Thank You for Your Order!
            </h1>
            <p className="text-stone-600 text-sm sm:text-base max-w-lg mx-auto">
              {isPaidOnline
                ? `Your online payment of €${placedOrder.total.toFixed(2)} was successfully processed via Stripe. Our chefs are preparing your food now!`
                : 'Our culinary team has received your order and our chefs are firing up the kitchen now.'}
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/70 text-left space-y-4 max-w-xl mx-auto">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200 text-sm">
              <span className="text-stone-500 font-medium">Order Reference:</span>
              <span className="font-extrabold text-orange-600 font-mono text-base">
                #{placedOrder.id}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-500">Estimated Delivery:</span>
              <span className="font-bold text-stone-800">30 – 45 Minutes</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-500">Payment Status:</span>
              <span
                className={`font-bold flex items-center gap-1.5 ${
                  isPaidOnline ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {isPaidOnline ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Paid Online via Card (€{placedOrder.total.toFixed(2)})</span>
                  </>
                ) : (
                  <span>Cash on Delivery (€{placedOrder.total.toFixed(2)})</span>
                )}
              </span>
            </div>

            {placedOrder.stripePaymentIntentId && (
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>Stripe Transaction Ref:</span>
                <span className="font-mono text-[11px] truncate max-w-[200px]">
                  {placedOrder.stripePaymentIntentId}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-500">Delivery To:</span>
              <span className="font-semibold text-stone-800 text-right truncate max-w-[250px]">
                {placedOrder.deliveryAddress}
              </span>
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Ordered Dishes:</p>
              {placedOrder.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-xs text-stone-700">
                  <span>
                    {i.quantity}x {i.name}
                  </span>
                  <span className="font-semibold">€{(i.sellingPrice * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Track Live Order Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-sm transition-all"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
          Delivery Checkout
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Review your address, choose your payment method, and confirm your meal.
        </p>
      </div>

      {/* Email Verification Gate */}
      {!isEmailVerified && (
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-300 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-amber-950">Email Verification Required</h3>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                To prevent spam and protect food orders, your email address (<strong>{currentUser.email}</strong>) must be verified before you can submit an order.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResendLink}
              disabled={resendingEmail}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              {resendingEmail ? 'Sending Link...' : 'Resend Verification Link'}
            </button>

            <button
              type="button"
              onClick={handleCheckVerification}
              disabled={checkingVerification}
              className="px-4 py-2 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingVerification ? 'animate-spin' : ''}`} />
              {checkingVerification ? 'Checking...' : "I've Clicked the Verification Link"}
            </button>
          </div>

          {emailSentNotice && (
            <p className="text-xs text-emerald-800 font-semibold pt-1">
              ✓ Verification link sent to your email inbox! Please click the link in the email and then tap "I've Clicked the Verification Link".
            </p>
          )}
        </div>
      )}

      {/* Checkout Form & Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Delivery & Payment Details */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
          <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            <span>1. Delivery Destination</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Contact Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+353 87 123 4567"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-stone-900"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Our driver will call this number when arriving.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Complete Street Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Street name, building/apartment number, floor, postal code (e.g. 15 Grafton Street, Apt 3B, Dublin D02)"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-stone-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Delivery Notes / Instructions <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Ring Apt 3B buzzer, leave at front door, extra napkins"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-stone-900"
              />
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm accent-orange-600"
              />
              <span className="text-xs text-stone-600 font-medium">
                Save this phone and address to my customer profile for faster future checkout
              </span>
            </label>
          </div>

          {/* Payment Method Selection */}
          <div className="pt-6 border-t border-stone-100 space-y-4">
            <h3 className="text-lg font-bold font-['Playfair_Display',serif] text-stone-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <span>2. Choose Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Stripe Card Payment */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50/60 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentChoice"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-4 h-4 text-orange-600 accent-orange-600"
                    />
                    <span className="font-bold text-sm text-stone-900">Online Card (Stripe)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    INSTANT
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 pl-6 leading-relaxed">
                  Pay securely with Visa, Mastercard, American Express, or Google Pay.
                </p>
              </div>

              {/* Option: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-orange-500 bg-orange-50/60 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentChoice"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-orange-600 accent-orange-600"
                    />
                    <span className="font-bold text-sm text-stone-900">Cash on Delivery</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                    COD
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 pl-6 leading-relaxed">
                  Pay the delivery driver directly in exact cash upon food arrival.
                </p>
              </div>
            </div>

            {/* Embedded Stripe Card Element or COD Form Action */}
            {paymentMethod === 'card' && (
              <div className="pt-2">
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    amount={total}
                    customerName={customerName}
                    customerEmail={currentUser.email || ''}
                    customerPhone={customerPhone}
                    isProcessing={submitting}
                    onSuccess={handleStripeSuccess}
                    onError={(msg) => setOrderError(msg)}
                  />
                </Elements>
              </div>
            )}
          </div>
        </div>

        {/* Right Order Review Box */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-md space-y-6 sticky top-28">
          <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-600" />
            <span>Order Summary</span>
          </h2>

          {/* Items Snapshot */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 font-extrabold flex items-center justify-center shrink-0">
                    {item.quantity}x
                  </span>
                  <span className="font-semibold text-stone-800 truncate max-w-[160px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-stone-900">
                  €{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Calculations */}
          <div className="pt-4 border-t border-stone-200 space-y-2.5 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Food & Drinks Subtotal</span>
              <span className="font-bold text-stone-900">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Thermal Delivery Fee</span>
              <span className="font-bold text-stone-900">€{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
              <span className="font-bold text-base">Grand Total</span>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-orange-600">€{total.toFixed(2)}</span>
                <span className="block text-[11px] text-stone-400">
                  {paymentMethod === 'card' ? 'Securely charged via Stripe' : 'Cash due upon delivery'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {orderError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{orderError}</span>
            </div>
          )}

          {/* Cash on Delivery Submit Button (Card Submit is handled inside StripeCardForm) */}
          {paymentMethod === 'cod' && (
            <button
              type="button"
              onClick={handleCODSubmit}
              disabled={submitting || !isEmailVerified}
              className={`w-full py-4 rounded-2xl font-extrabold text-base shadow-lg flex items-center justify-center gap-2 transition-all ${
                submitting || !isEmailVerified
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                  : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-orange-600/30'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Placing Cash on Delivery Order...</span>
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  <span>Confirm Cash on Delivery Order</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}

          <p className="text-[11px] text-stone-400 text-center">
            {paymentMethod === 'card'
              ? 'Card transactions are encrypted via 256-bit SSL and processed directly by Stripe.'
              : 'By confirming, you agree to pay the courier in cash upon receiving your order.'}
          </p>
        </div>
      </div>
    </div>
  );
};
