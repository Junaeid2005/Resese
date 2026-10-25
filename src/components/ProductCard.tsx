import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { MenuItem } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  item: MenuItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  // Check if item is already in cart
  const cartItem = items.find((i) => i.productId === item.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    if (!item.isAvailable) return;
    addToCart(item, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col h-full">
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            // High quality fallback food image if url broken
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-stone-800 shadow-sm">
            {item.category}
          </span>
          {item.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Chef Pick
            </span>
          )}
        </div>

        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-extrabold uppercase tracking-widest shadow-md">
              Sold Out Today
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-lg text-stone-900 font-['Playfair_Display',serif] leading-snug group-hover:text-orange-600 transition-colors">
              {item.name}
            </h3>
            <span className="font-extrabold text-lg text-orange-600 shrink-0">
              €{item.sellingPrice.toFixed(2)}
            </span>
          </div>

          <p className="text-stone-500 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Action Button: Add to Cart or Quantity Stepper */}
        <div className="pt-3 border-t border-stone-100 mt-auto">
          {item.isAvailable ? (
            currentQty > 0 ? (
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-2xl p-1">
                <button
                  onClick={() => updateQuantity(item.id, currentQty - 1)}
                  className="w-8 h-8 rounded-xl bg-white text-stone-700 flex items-center justify-center shadow-xs hover:bg-orange-600 hover:text-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center px-2">
                  <span className="text-xs text-orange-950/70 font-medium">In Cart: </span>
                  <span className="font-extrabold text-sm text-orange-900">{currentQty}</span>
                </div>
                <button
                  onClick={() => updateQuantity(item.id, currentQty + 1)}
                  className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs hover:bg-orange-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 text-white hover:bg-orange-600 active:scale-98'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Order
                  </>
                )}
              </button>
            )
          ) : (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-2xl font-bold text-sm bg-stone-100 text-stone-400 cursor-not-allowed"
            >
              Currently Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
