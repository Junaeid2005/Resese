import React, { useState } from 'react';
import {
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Star,
  Flame,
  Award,
  ChevronRight,
  Truck,
  HeartHandshake,
} from 'lucide-react';
import { MenuItem, ProductCategory, RestaurantSettings } from '../types';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  menuItems: MenuItem[];
  onNavigate: (tab: string, categoryFilter?: string) => void;
  settings: RestaurantSettings;
}

const CATEGORIES: { label: string; value: ProductCategory | 'All'; icon: string }[] = [
  { label: 'All Dishes', value: 'All', icon: '🍽️' },
  { label: 'Burgers', value: 'Burgers', icon: '🍔' },
  { label: 'Pizza', value: 'Pizza', icon: '🍕' },
  { label: 'Pasta', value: 'Pasta', icon: '🍝' },
  { label: 'Sides', value: 'Sides', icon: '🍟' },
  { label: 'Drinks', value: 'Drinks', icon: '🥤' },
];

export const HomePage: React.FC<HomePageProps> = ({ menuItems, onNavigate, settings }) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((i) => i.category === selectedCategory);

  const featuredItems = menuItems.filter((i) => i.isFeatured).slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-radial from-orange-50 via-[#FAF7F2] to-[#FAF7F2] pt-8 pb-16 sm:py-20 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs sm:text-sm font-bold tracking-wide">
                <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
                <span>Dublin's Most Beloved Artisan Bistro & Kitchen</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold font-['Playfair_Display',serif] text-stone-900 tracking-tight leading-[1.12]">
                Savor Every Bite of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700">
                  Culinary Perfection
                </span>
              </h1>

              <p className="text-base sm:text-xl text-stone-600 max-w-2xl leading-relaxed font-normal">
                {settings.description ||
                  'Handcrafted burgers, stone-baked sourdough pizzas, and velvet pastas prepared fresh to order using finest local ingredients.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('menu')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 group transition-all"
                >
                  <span>Order Online Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('about')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-base border border-stone-300 shadow-xs transition-all"
                >
                  Our Kitchen Story
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-stone-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-stone-600 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-stone-800">4.9/5 Rating</span>
                  <span className="text-stone-400">(2,400+ reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold text-stone-800">30-40 min avg. delivery</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glowing backdrop */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-orange-400/20 to-amber-300/30 blur-2xl -z-10"></div>

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80"
                    alt="Savory Bite Signature Gourmet Table"
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                      Signature Creation
                    </span>
                    <h3 className="text-xl font-bold font-['Playfair_Display',serif]">
                      Smoked Angus & Truffle Cream Fettuccine
                    </h3>
                    <p className="text-xs text-stone-300 mt-1">Available for express delivery</p>
                  </div>
                </div>

                {/* Floating Highlight Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-stone-100 hidden sm:flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-xl">
                    🔥
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                      Special Offer
                    </p>
                    <p className="font-bold text-stone-900 text-sm">
                      Cash on Delivery Available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-base">Swift Delivery</h4>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Insulated thermal bags maintain heat and crunch right to your doorstep.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-base">Farm-to-Table</h4>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                100% prime grass-fed beef, artisan cheeses, and morning-harvested produce.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-base">Hygiene Certified</h4>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Five-star rated kitchen hygiene and tamper-evident sealed packaging.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-base">Cash on Delivery</h4>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Pay safely in cash when your fresh food arrives at your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Food Items by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-widest mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Explore Our Menu</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
              Popular Dishes & Favorites
            </h2>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  selectedCategory === cat.value
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'bg-white border border-stone-200 text-stone-700 hover:border-orange-200 hover:bg-orange-50/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500">
            <p className="text-lg font-semibold text-stone-700">No items found in this category.</p>
            <p className="text-sm mt-1">Please explore another category or view the complete menu.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-stone-300 hover:border-orange-500 text-stone-800 hover:text-orange-600 font-bold text-sm shadow-xs transition-all"
          >
            <span>View Full Menu & All Dishes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Featured Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 text-white p-8 sm:p-14 shadow-2xl border border-stone-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-orange-600 text-white inline-block">
                Weekend Family Special
              </span>
              <h3 className="text-3xl sm:text-5xl font-extrabold font-['Playfair_Display',serif] leading-tight">
                Gourmet Feast Delivered Fresh
              </h3>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Enjoy 2 Artisanal Burgers, 1 Margherita Sourdough Pizza, 2 Golden Fries, and 2 Fresh Lemonades with complimentary delivery.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => onNavigate('menu')}
                  className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 transition-all"
                >
                  Order This Combo
                </button>
                <div className="text-left">
                  <span className="text-xs text-stone-400 block line-through">Value: €38.50</span>
                  <span className="text-xl font-extrabold text-amber-400">Now €29.99</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                alt="Delicious Gourmet Feast"
                className="rounded-2xl shadow-xl object-cover w-full h-72 border-2 border-stone-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
            What Our Food Lovers Say
          </h2>
          <p className="text-stone-500 text-sm sm:text-base mt-2">
            Real reviews from our neighborhood regulars and food critics across Dublin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-stone-700 italic leading-relaxed">
                "The Classic Burger has the juiciest beef patty in town. Arrived piping hot in less than 35 minutes. Absolutely restaurant-quality at home!"
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                SM
              </div>
              <div>
                <p className="font-bold text-xs text-stone-900">Sarah Montgomery</p>
                <p className="text-[11px] text-stone-400">Verified Diner • Temple Bar</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-stone-700 italic leading-relaxed">
                "The hand-stretched Margherita crust is authentic Neapolitan style. Blown away by the fresh basil fragrance and creamy mozzarella."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                DC
              </div>
              <div>
                <p className="font-bold text-xs text-stone-900">David Clarke</p>
                <p className="text-[11px] text-stone-400">Verified Diner • Ranelagh</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-stone-700 italic leading-relaxed">
                "Ordering online is super fast, the cart stays saved even when I close my tab, and Cash on Delivery is so convenient. Five stars!"
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                EL
              </div>
              <div>
                <p className="font-bold text-xs text-stone-900">Emma Lynch</p>
                <p className="text-[11px] text-stone-400">Verified Diner • Grand Canal Dock</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
