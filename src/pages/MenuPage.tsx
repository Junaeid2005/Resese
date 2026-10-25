import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Utensils, X } from 'lucide-react';
import { MenuItem, ProductCategory } from '../types';
import { ProductCard } from '../components/ProductCard';

interface MenuPageProps {
  menuItems: MenuItem[];
  initialCategory?: ProductCategory | 'All';
}

const CATEGORIES: { label: string; value: ProductCategory | 'All'; icon: string }[] = [
  { label: 'All', value: 'All', icon: '🍽️' },
  { label: 'Burgers', value: 'Burgers', icon: '🍔' },
  { label: 'Pizza', value: 'Pizza', icon: '🍕' },
  { label: 'Pasta', value: 'Pasta', icon: '🍝' },
  { label: 'Sides', value: 'Sides', icon: '🍟' },
  { label: 'Drinks', value: 'Drinks', icon: '🥤' },
];

export const MenuPage: React.FC<MenuPageProps> = ({ menuItems, initialCategory = 'All' }) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAvailability = onlyAvailable ? item.isAvailable : true;
        return matchesCategory && matchesSearch && matchesAvailability;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Featured first
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [menuItems, selectedCategory, searchQuery, sortBy, onlyAvailable]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 bg-orange-100/70 px-3.5 py-1 rounded-full inline-block">
          Artisanal Culinary Menu
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
          Handcrafted Food & Drinks
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Prepared with fresh, high-grade ingredients and cooked to order for peak flavor.
        </p>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, pizzas, pastas, sides, or drinks..."
              className="w-full pl-11 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-stone-900 transition-all placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Availability Selectors */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-2 text-xs font-semibold text-stone-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none text-stone-900 font-bold cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>

            <label className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500 accent-orange-600"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                selectedCategory === cat.value
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Active Filters Summary */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500 px-1">
        <span>
          Showing <strong className="text-stone-900">{filteredItems.length}</strong> delicious items
        </span>
        {(searchQuery || selectedCategory !== 'All' || onlyAvailable) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setOnlyAvailable(false);
            }}
            className="text-orange-600 hover:underline font-bold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200/80 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Utensils className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-stone-900 font-['Playfair_Display',serif]">
            No matching dishes found
          </h3>
          <p className="text-sm text-stone-500">
            We couldn't find any dishes matching "{searchQuery}". Try searching for something else or reset your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setOnlyAvailable(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
