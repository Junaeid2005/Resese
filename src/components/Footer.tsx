import React from 'react';
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import { RestaurantSettings } from '../types';

interface FooterProps {
  onNavigate: (tab: string) => void;
  settings: RestaurantSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-bold text-2xl font-['Playfair_Display',serif] text-white">
                {settings.restaurantName || 'Savory Bite'}
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              {settings.description ||
                'Handcrafted gourmet dining made with passionate culinary art and locally sourced fresh ingredients.'}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-xs text-amber-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Practice version: Cash on Delivery supported</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide uppercase font-['Playfair_Display',serif]">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-orange-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-orange-400 transition-colors"
                >
                  Explore Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-orange-400 transition-colors"
                >
                  About Our Kitchen
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-orange-400 transition-colors"
                >
                  Contact & Location
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-orange-400 transition-colors"
                >
                  Customer Account & Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide uppercase font-['Playfair_Display',serif]">
              Opening Hours
            </h4>
            <div className="flex items-start gap-3 text-sm text-stone-400">
              <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-200">Dine-in & Delivery</p>
                <p className="mt-1">{settings.openingHours || 'Mon - Sun: 11:30 AM – 10:30 PM'}</p>
                <p className="text-xs text-stone-500 mt-2">Kitchen closes 30 mins before closing time.</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-wide uppercase font-['Playfair_Display',serif]">
              Find Us
            </h4>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span>{settings.address || '42 Culinary Boulevard, Temple Bar, Dublin D02 X942'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-orange-400 transition-colors">
                  {settings.phone || '+353 1 892 4400'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-orange-400 transition-colors">
                  {settings.email || 'hello@savorybite.com'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Savory Bite Restaurant. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('admin')} className="text-stone-400 hover:text-amber-400">
              Admin Portal
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              Cooked with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> & Passion
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
