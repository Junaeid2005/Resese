import React, { useState } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Receipt,
  Settings,
  ShieldCheck,
  ArrowLeft,
  Menu as MenuIcon,
  X,
  Lock,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MenuItem, Order, Expense, RestaurantSettings } from '../../types';
import { AdminOverview } from './AdminOverview';
import { AdminMenuManagement } from './AdminMenuManagement';
import { AdminOrderManagement } from './AdminOrderManagement';
import { AdminExpenseManagement } from './AdminExpenseManagement';
import { AdminSettingsManagement } from './AdminSettingsManagement';
import { AdminSecurityGuide } from './AdminSecurityGuide';

interface AdminPortalProps {
  menuItems: MenuItem[];
  orders: Order[];
  expenses: Expense[];
  settings: RestaurantSettings;
  onNavigateHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  menuItems,
  orders,
  expenses,
  settings,
  onNavigateHome,
}) => {
  const { currentUser, isAdmin, signOutUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'menu' | 'orders' | 'expenses' | 'settings' | 'security'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Unauthorized Access Gate
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 border border-stone-200/90 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700">
              Access Restricted
            </span>
            <h1 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900">
              Administrative Clearance Required
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              {currentUser
                ? `You are signed in as ${currentUser.email}, but this account does not have administrative privileges.`
                : 'You must be signed in with an authorized restaurant administrator account to access this portal.'}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Security Guarantee</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Administrative functions and financial data are strictly protected via Firestore Security Rules. Customer accounts cannot self-elevate.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onNavigateHome}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Return to Customer Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu & Dishes', icon: UtensilsCrossed },
    { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag, count: orders.filter((o) => o.status === 'pending').length },
    { id: 'expenses', label: 'Operating Expenses', icon: Receipt },
    { id: 'settings', label: 'Restaurant Settings', icon: Settings },
    { id: 'security', label: 'Security & Netlify Guide', icon: ShieldCheck },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm font-['Playfair_Display',serif]">Admin Portal</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-stone-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } lg:block w-full lg:w-72 bg-stone-900 text-stone-300 shrink-0 border-r border-stone-800 flex flex-col justify-between z-40`}
      >
        <div className="p-6 space-y-8">
          {/* Brand header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg font-['Playfair_Display',serif] text-white">
                  {settings.restaurantName || 'Savory Bite'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Operations Console
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {'count' in item && item.count !== undefined && item.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-stone-900 font-extrabold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-stone-800 space-y-3">
          <div className="text-xs text-stone-400 truncate">
            <span className="text-[10px] uppercase block text-stone-500 font-bold">Logged In Admin</span>
            <span className="font-semibold text-stone-200">{currentUser.email}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onNavigateHome}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>
            <button
              onClick={async () => {
                await signOutUser();
                onNavigateHome();
              }}
              className="py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {activeSection === 'overview' && (
          <AdminOverview
            orders={orders}
            expenses={expenses}
            menuItems={menuItems}
            onNavigateSection={(sec: any) => setActiveSection(sec)}
          />
        )}

        {activeSection === 'menu' && <AdminMenuManagement menuItems={menuItems} />}

        {activeSection === 'orders' && <AdminOrderManagement orders={orders} />}

        {activeSection === 'expenses' && <AdminExpenseManagement expenses={expenses} />}

        {activeSection === 'settings' && <AdminSettingsManagement settings={settings} />}

        {activeSection === 'security' && <AdminSecurityGuide />}
      </main>
    </div>
  );
};
