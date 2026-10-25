import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AuthPages } from './pages/AuthPages';
import { AdminPortal } from './pages/admin/AdminPortal';
import {
  MenuItem,
  Order,
  Expense,
  RestaurantSettings,
  ProductCategory,
} from './types';
import {
  seedInitialDataIfEmpty,
  subscribeToMenuItems,
  subscribeToRestaurantSettings,
  subscribeToAllOrders,
  subscribeToExpenses,
} from './services/dbService';
import { DEFAULT_RESTAURANT_SETTINGS, INITIAL_MENU_ITEMS } from './data/initialData';

function MainApp() {
  const { currentUser, isAdmin } = useAuth();
  const { setDeliveryFeeRate } = useCart();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [initialCategoryFilter, setInitialCategoryFilter] = useState<ProductCategory | 'All'>('All');

  // Real-time Firestore state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_RESTAURANT_SETTINGS);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

  // Seed on boot & subscribe to public catalogs
  useEffect(() => {
    seedInitialDataIfEmpty();

    const unsubMenu = subscribeToMenuItems((items) => {
      if (items.length > 0) {
        setMenuItems(items);
      }
    });

    const unsubSettings = subscribeToRestaurantSettings((newSettings) => {
      setSettings(newSettings);
      if (newSettings.deliveryFee !== undefined) {
        setDeliveryFeeRate(newSettings.deliveryFee);
      }
    });

    return () => {
      unsubMenu();
      unsubSettings();
    };
  }, []);

  // Admin subscriptions (only when user is recognized as admin)
  useEffect(() => {
    if (!isAdmin) {
      setAllOrders([]);
      setAllExpenses([]);
      return;
    }

    const unsubOrders = subscribeToAllOrders(
      (orders) => setAllOrders(orders),
      (err) => console.warn('Admin orders listener note:', err)
    );

    const unsubExpenses = subscribeToExpenses(
      (exp) => setAllExpenses(exp),
      (err) => console.warn('Admin expenses listener note:', err)
    );

    return () => {
      unsubOrders();
      unsubExpenses();
    };
  }, [isAdmin]);

  const handleNavigate = (tab: string, categoryFilter?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (categoryFilter) {
      setInitialCategoryFilter(categoryFilter as ProductCategory | 'All');
    }
    setCurrentTab(tab);
  };

  // If in Admin Portal
  if (currentTab === 'admin') {
    return (
      <AdminPortal
        menuItems={menuItems}
        orders={allOrders}
        expenses={allExpenses}
        settings={settings}
        onNavigateHome={() => handleNavigate('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        settings={settings}
      />

      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            menuItems={menuItems}
            onNavigate={handleNavigate}
            settings={settings}
          />
        )}

        {currentTab === 'menu' && (
          <MenuPage
            menuItems={menuItems}
            initialCategory={initialCategoryFilter}
          />
        )}

        {currentTab === 'about' && (
          <AboutUsPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'contact' && (
          <ContactPage settings={settings} />
        )}

        {currentTab === 'cart' && (
          <CartPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'dashboard' && (
          <CustomerDashboard onNavigate={handleNavigate} />
        )}

        {currentTab === 'signin' && (
          <AuthPages initialMode="signin" onNavigate={handleNavigate} />
        )}

        {currentTab === 'signup' && (
          <AuthPages initialMode="signup" onNavigate={handleNavigate} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} settings={settings} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
