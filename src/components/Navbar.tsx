import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  User as UserIcon,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  LogOut,
  ChevronDown,
  AlertCircle,
  MailCheck,
  Compass,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { RestaurantSettings } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  settings: RestaurantSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, settings }) => {
  const { currentUser, userProfile, isAdmin, isEmailVerified, signOutUser, sendVerificationEmail } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      await sendVerificationEmail();
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Could not send verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Promotional Announcement Banner */}
      {settings.promoBannerText && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white text-xs sm:text-sm font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2 tracking-wide shadow-inner">
          <span>{settings.promoBannerText}</span>
        </div>
      )}

      {/* Unverified Email Alert Banner */}
      {currentUser && !isEmailVerified && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs sm:text-sm text-amber-900 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Action required:</strong> Please verify your email ({currentUser.email}) to place orders.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {verificationSent ? (
              <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                <MailCheck className="w-3.5 h-3.5" /> Verification link sent! Check your inbox.
              </span>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resendingEmail}
                className="underline font-semibold hover:text-amber-950 text-xs disabled:opacity-50"
              >
                {resendingEmail ? 'Sending...' : 'Resend Link'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-2xl font-['Playfair_Display',serif] tracking-tight text-stone-900">
                  {settings.restaurantName || 'Savory Bite'}
                </span>
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Gourmet Dining & Delivery
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-orange-600 bg-orange-50 shadow-xs'
                      : 'text-stone-700 hover:text-orange-600 hover:bg-stone-100/70'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons (Cart & User) */}
          <div className="flex items-center gap-3">
            {/* Shopping Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className={`relative flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 ${
                currentTab === 'cart'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-white border border-stone-200 text-stone-800 hover:border-orange-300 hover:bg-orange-50/50'
              }`}
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span
                  className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 min-w-[20px] text-[11px] font-extrabold rounded-full flex items-center justify-center leading-none ${
                    currentTab === 'cart'
                      ? 'bg-stone-900 text-white'
                      : 'bg-orange-600 text-white shadow-xs'
                  }`}
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Auth Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl border border-stone-200 bg-white hover:border-stone-300 text-stone-800 transition-all text-sm font-medium shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs uppercase">
                    {currentUser.displayName ? currentUser.displayName[0] : currentUser.email?.[0] || 'U'}
                  </div>
                  <span className="hidden lg:inline-block max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  {isAdmin && (
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      ADMIN
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs text-stone-500">Signed in as</p>
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {currentUser.displayName || 'Customer'}
                      </p>
                      <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2.5"
                      >
                        <UserIcon className="w-4 h-4 text-stone-500" />
                        Customer Dashboard
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-amber-800 font-semibold bg-amber-50/60 hover:bg-amber-100/70 flex items-center gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Admin Portal
                        </button>
                      )}
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await signOutUser();
                          onNavigate('home');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('signin')}
                  className="px-3.5 py-2 text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl shadow-xs shadow-orange-600/20 transition-all"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                currentTab === link.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/60'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-stone-200 space-y-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-stone-800 font-semibold hover:bg-stone-200/60 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-orange-600" />
                  Customer Dashboard & Orders
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-amber-900 bg-amber-100 font-bold flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Admin Portal (Management & Analytics)
                  </button>
                )}

                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOutUser();
                    onNavigate('home');
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    onNavigate('signin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-center font-bold text-stone-700 bg-white border border-stone-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-center font-bold text-white bg-orange-600 shadow-md shadow-orange-600/30"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
