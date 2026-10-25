import React from 'react';
import { Award, Flame, Heart, Users, Sparkles, ChefHat } from 'lucide-react';

interface AboutUsPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-10 pb-20">
      {/* Hero Header */}
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 bg-orange-100/70 px-3.5 py-1 rounded-full inline-block">
          Our Heritage & Passion
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-['Playfair_Display',serif] text-stone-900 leading-tight">
          Crafting Unforgettable Flavors with Passion and Integrity
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Founded in Dublin, Savory Bite began with a simple culinary promise: serve honest, elevated comfort food cooked with artisanal technique and farm-fresh ingredients.
        </p>
      </div>

      {/* Story & Image Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80"
              alt="Kitchen Chef Cooking"
              className="rounded-3xl shadow-xl w-full h-[420px] object-cover border-4 border-white"
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-stone-200 hidden sm:flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-stone-900 text-sm">Wood-Fired & Grilled</p>
                <p className="text-xs text-stone-500">Every single order made fresh</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
              The Philosophy Behind Every Dish
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              At Savory Bite, we believe that dining should nourish both the body and the spirit. We avoid frozen shortcuts, mass-produced burger patties, and artificial flavorings. Instead, our meat is 100% prime grass-fed Angus beef ground fresh daily, our pizza dough undergoes a 48-hour slow fermentation, and our pasta dough is rolled by hand each morning.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              Whether you are dining in or ordering from the comfort of your living room, our kitchen adheres to the highest European food safety, quality, and hygiene benchmarks.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                <span className="text-2xl font-extrabold text-orange-600">100%</span>
                <p className="font-bold text-stone-900 text-xs">Irish Grass-Fed Beef</p>
                <p className="text-[11px] text-stone-500">Ethically farmed from trusted local suppliers</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                <span className="text-2xl font-extrabold text-orange-600">48h</span>
                <p className="font-bold text-stone-900 text-xs">Cold Fermentation</p>
                <p className="text-[11px] text-stone-500">For light, airy, digestible sourdough pizza crusts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Culinary Team */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
            Meet Our Kitchen Masters
          </h2>
          <p className="text-stone-500 text-sm">
            Trained in top Michelin-starred kitchens across Europe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs text-center p-6 space-y-4">
            <img
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80"
              alt="Executive Chef Marco Rossi"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-orange-500 shadow-md"
            />
            <div>
              <h3 className="font-bold text-lg text-stone-900 font-['Playfair_Display',serif]">
                Marco Rossi
              </h3>
              <p className="text-xs font-semibold text-orange-600">Head Executive Chef</p>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                15+ years crafting artisanal sourdough pizzas and classic sauces with deep Mediterranean roots.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs text-center p-6 space-y-4">
            <img
              src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80"
              alt="Sous Chef Liam O'Connor"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-orange-500 shadow-md"
            />
            <div>
              <h3 className="font-bold text-lg text-stone-900 font-['Playfair_Display',serif]">
                Liam O'Connor
              </h3>
              <p className="text-xs font-semibold text-orange-600">Grill Master & Artisan</p>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Specializes in prime cut dry-aging, signature house sauces, and flame-seared Angus burgers.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs text-center p-6 space-y-4">
            <img
              src="https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=400&q=80"
              alt="Pastry Chef Elena Vance"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-orange-500 shadow-md"
            />
            <div>
              <h3 className="font-bold text-lg text-stone-900 font-['Playfair_Display',serif]">
                Elena Vance
              </h3>
              <p className="text-xs font-semibold text-orange-600">Beverage & Dessert Artisan</p>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Creator of our cold-pressed Sicilian lemonades, lavender honey infusions, and sweet treats.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 space-y-4 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold font-['Playfair_Display',serif]">
            Ready to Taste the Difference?
          </h3>
          <p className="text-stone-300 text-sm max-w-lg mx-auto">
            Order online today and experience the crisp, savory flavors of Savory Bite delivered right to your door.
          </p>
          <button
            onClick={() => onNavigate('menu')}
            className="px-8 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 transition-all inline-block"
          >
            Explore the Menu
          </button>
        </div>
      </div>
    </div>
  );
};
