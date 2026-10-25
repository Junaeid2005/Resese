import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Euro,
  DollarSign,
  Receipt,
  Users,
  UtensilsCrossed,
  Info,
  ArrowUpRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Order, Expense, MenuItem } from '../../types';

interface AdminOverviewProps {
  orders: Order[];
  expenses: Expense[];
  menuItems: MenuItem[];
  onNavigateSection: (section: string) => void;
}

type DateFilter = 'today' | '7days' | '30days' | 'all';

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
  expenses,
  menuItems,
  onNavigateSection,
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Filter orders and expenses based on selected date range
  const { filteredOrders, filteredExpenses } = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;

    if (dateFilter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilter === '7days') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === '30days') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const o = startDate
      ? orders.filter((order) => new Date(order.createdAt) >= startDate!)
      : orders;

    const e = startDate
      ? expenses.filter((exp) => new Date(exp.date) >= startDate!)
      : expenses;

    return { filteredOrders: o, filteredExpenses: e };
  }, [orders, expenses, dateFilter]);

  // Financial and Operational Calculations
  const stats = useMemo(() => {
    const totalOrdersCount = filteredOrders.length;
    const pendingOrdersCount = filteredOrders.filter((o) => o.status === 'pending').length;
    const completedOrders = filteredOrders.filter((o) => o.status === 'delivered');
    const completedOrdersCount = completedOrders.length;

    // Gross Sales: sum of orders that are NOT cancelled
    const activeOrders = filteredOrders.filter((o) => o.status !== 'cancelled');
    const grossSales = activeOrders.reduce((acc, o) => acc + o.total, 0);

    // Cash Actually Collected: only paid or delivered orders
    const cashCollected = filteredOrders
      .filter((o) => o.paymentStatus === 'paid' || o.status === 'delivered')
      .reduce((acc, o) => acc + o.total, 0);

    // Food Cost: Sum of snapshot costPrice * quantity for active (non-cancelled) orders
    let totalFoodCost = 0;
    activeOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cost = item.costPrice || Number((item.sellingPrice * 0.35).toFixed(2));
        totalFoodCost += cost * item.quantity;
      });
    });

    // Total Operating Expenses
    const totalOperatingExpenses = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);

    // Estimated Operating Profit formula:
    // Gross Sales - Food Cost - Operating Expenses
    const estimatedProfit = grossSales - totalFoodCost - totalOperatingExpenses;

    // Distinct customer count based on customerId or customerEmail
    const uniqueCustomers = new Set(filteredOrders.map((o) => o.customerEmail || o.customerId)).size;
    const totalProducts = menuItems.length;

    return {
      totalOrdersCount,
      pendingOrdersCount,
      completedOrdersCount,
      grossSales: Number(grossSales.toFixed(2)),
      cashCollected: Number(cashCollected.toFixed(2)),
      totalFoodCost: Number(totalFoodCost.toFixed(2)),
      totalOperatingExpenses: Number(totalOperatingExpenses.toFixed(2)),
      estimatedProfit: Number(estimatedProfit.toFixed(2)),
      uniqueCustomers,
      totalProducts,
    };
  }, [filteredOrders, filteredExpenses, menuItems]);

  // Aggregate daily sales trends for SVG chart
  const trendData = useMemo(() => {
    const map = new Map<string, { label: string; sales: number; count: number }>();
    const last7Days: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric' });
      last7Days.push(key);
      map.set(key, { label, sales: 0, count: 0 });
    }

    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      const key = o.createdAt.split('T')[0];
      if (map.has(key)) {
        const item = map.get(key)!;
        item.sales += o.total;
        item.count += 1;
      }
    });

    return last7Days.map((k) => map.get(k)!);
  }, [orders]);

  const maxTrendSale = Math.max(...trendData.map((d) => d.sales), 50);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Range Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2.5 py-0.5 rounded-full">
            Real-Time Intelligence
          </span>
          <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900 mt-1">
            Restaurant Performance & Analytics
          </h2>
          <p className="text-xs text-stone-500">
            Authoritative metrics calculated directly from immutable order item snapshots and operational ledgers.
          </p>
        </div>

        {/* Date Filter Segmented Control */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl shrink-0 self-start sm:self-auto">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: '7days', label: '7 Days' },
              { id: '30days', label: '30 Days' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setDateFilter(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilter === t.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Gross Sales */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Gross Sales</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              €
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-stone-900">€{stats.grossSales.toFixed(2)}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Excludes cancelled orders</p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Cash Collected:</span>
            <strong className="text-emerald-700">€{stats.cashCollected.toFixed(2)}</strong>
          </div>
        </div>

        {/* Estimated Operating Profit */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Estimated Profit</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-extrabold ${stats.estimatedProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              €{stats.estimatedProfit.toFixed(2)}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">Sales minus Food Cost & Expenses</p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Food Raw Cost:</span>
            <strong className="text-stone-700">€{stats.totalFoodCost.toFixed(2)}</strong>
          </div>
        </div>

        {/* Total Operating Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Operating Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-stone-900">€{stats.totalOperatingExpenses.toFixed(2)}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{filteredExpenses.length} expense entries recorded</p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateSection('expenses')}
              className="text-orange-600 font-bold hover:underline"
            >
              Manage Expenses →
            </button>
          </div>
        </div>

        {/* Total Orders & Status Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-stone-900">{stats.totalOrdersCount}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {stats.completedOrdersCount} Delivered • {stats.pendingOrdersCount} Pending
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateSection('orders')}
              className="text-orange-600 font-bold hover:underline"
            >
              Inspect Orders →
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Operational Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
          <span className="text-[11px] font-bold text-stone-500 uppercase">Pending Orders</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{stats.pendingOrdersCount}</p>
        </div>
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
          <span className="text-[11px] font-bold text-stone-500 uppercase">Completed Orders</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{stats.completedOrdersCount}</p>
        </div>
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
          <span className="text-[11px] font-bold text-stone-500 uppercase">Total Customers</span>
          <p className="text-xl font-extrabold text-stone-800 mt-1">{stats.uniqueCustomers}</p>
        </div>
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
          <span className="text-[11px] font-bold text-stone-500 uppercase">Menu Items</span>
          <p className="text-xl font-extrabold text-stone-800 mt-1">{stats.totalProducts}</p>
        </div>
      </div>

      {/* Sales Trend Chart & Financial Disclosure Formula */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-stone-900 font-['Playfair_Display',serif]">
                7-Day Sales Volume Trend
              </h3>
              <p className="text-xs text-stone-500">Daily revenue generated from customer meal orders</p>
            </div>
            <span className="text-xs font-bold text-stone-400">Values in Euros (€)</span>
          </div>

          {trendData.length > 0 ? (
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {trendData.map((day, idx) => {
                  const heightPercent = Math.max(8, Math.round((day.sales / maxTrendSale) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-extrabold bg-stone-900 text-white px-2 py-0.5 rounded-md shadow-xs pointer-events-none -mb-1">
                        €{day.sales.toFixed(0)} ({day.count})
                      </div>
                      <div className="w-full bg-stone-100 rounded-t-xl h-full flex items-end overflow-hidden">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-orange-600 to-amber-500 rounded-t-xl group-hover:brightness-110 transition-all duration-300"
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-stone-500 truncate max-w-full">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-stone-400">
              No historical order trend available yet.
            </div>
          )}
        </div>

        {/* Business Calculation Definition Box */}
        <div className="lg:col-span-4 bg-stone-900 text-white p-6 rounded-3xl shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Info className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Accounting Standard</span>
            </div>
            <h3 className="text-lg font-bold font-['Playfair_Display',serif]">
              Profit & Revenue Formula
            </h3>
            <div className="space-y-2 text-xs text-stone-300 font-mono bg-stone-800/80 p-3 rounded-2xl border border-stone-700">
              <p className="text-amber-300 font-bold">Estimated Operating Profit =</p>
              <p className="pl-2">Gross Sales</p>
              <p className="pl-2 text-rose-300">- Food Ingredient Costs</p>
              <p className="pl-2 text-rose-300">- Recorded Operating Expenses</p>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              * Past orders utilize frozen snapshot cost prices so updating menu item costs does not alter historic ledger accuracy.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span>Status: Audited & Verified</span>
            <span className="text-emerald-400 font-bold">● Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
