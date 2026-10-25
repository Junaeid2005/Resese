import React from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Info,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartPageProps {
  onNavigate: (tab: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { items, subtotal, deliveryFee, total, updateQuantity, removeFromCart, clearCart, loadingCart } = useCart();
  const { currentUser } = useAuth();

  if (loadingCart) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-stone-600 font-medium">Synchronizing your saved cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-orange-100/80 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
            Your Cart is Hungry
          </h2>
          <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
            You haven't added any delicious food or drinks to your cart yet. Explore our handcrafted menu to get started!
          </p>
        </div>
        <div>
          <button
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base shadow-lg shadow-orange-600/30 transition-all"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <button
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-orange-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Ordering</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
            Your Order Basket
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/60 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Basket</span>
        </button>
      </div>

      {/* Guest Warning / Cloud Sync Notice */}
      {!currentUser ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>Guest Cart:</strong> Your basket is currently stored in this browser only.{' '}
            <button
              onClick={() => onNavigate('signin')}
              className="underline font-bold hover:text-amber-950 ml-1"
            >
              Sign In or Register
            </button>{' '}
            to safely save your items to your cloud account across devices!
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-900 text-xs sm:text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Cloud Cart Active:</strong> Synced with your secure Firebase account ({currentUser.email}).
          </span>
        </div>
      )}

      {/* Two Column Layout: Items List & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-5 transition-all hover:border-orange-200"
            >
              {/* Product Thumbnail */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>

              {/* Item Info */}
              <div className="flex-1 text-center sm:text-left space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full inline-block">
                  {item.category}
                </span>
                <h3 className="font-bold text-lg text-stone-900 font-['Playfair_Display',serif]">
                  {item.name}
                </h3>
                <p className="text-xs text-stone-500">Unit Price: €{item.price.toFixed(2)}</p>
              </div>

              {/* Stepper & Line Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-stone-100">
                {/* Quantity Stepper */}
                <div className="flex items-center bg-stone-100 rounded-2xl p-1 border border-stone-200">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 rounded-xl bg-white text-stone-700 flex items-center justify-center shadow-xs hover:bg-orange-600 hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-9 text-center font-extrabold text-sm text-stone-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs hover:bg-orange-700 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right min-w-[70px]">
                  <span className="text-xs text-stone-400 block sm:hidden">Line Total:</span>
                  <span className="font-extrabold text-lg text-stone-900">
                    €{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-md space-y-6 sticky top-28">
          <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-stone-900 border-b border-stone-100 pb-4">
            Payment Summary
          </h2>

          <div className="space-y-3 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-stone-900">€{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                Standard Delivery
                <span className="text-[10px] text-stone-400 font-normal">(Thermal Express)</span>
              </span>
              <span className="font-bold text-stone-900">€{deliveryFee.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
              <span className="text-base font-bold">Total Payable</span>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-orange-600">€{total.toFixed(2)}</span>
                <span className="block text-[11px] text-stone-400">VAT Included</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Cash on Delivery</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Pay the delivery rider in exact cash or card at your doorstep when your food arrives hot!
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) {
                onNavigate('signin');
              } else {
                onNavigate('checkout');
              }
            }}
            className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 group transition-all"
          >
            <span>{currentUser ? 'Proceed to Checkout' : 'Sign In to Checkout'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
