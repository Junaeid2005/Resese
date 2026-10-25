import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  PackageCheck,
  RefreshCw,
  Eye,
  MapPin,
  Phone,
  Mail,
  Calendar,
  X,
  CreditCard,
  User,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { updateOrderStatus } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';

interface AdminOrderManagementProps {
  orders: Order[];
}

export const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({ orders }) => {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Updating order state
  const [updating, setUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  // Customer order history drawer
  const [inspectCustomerEmail, setInspectCustomerEmail] = useState<string | null>(null);

  // Filtering
  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const s = search.toLowerCase();
    const matchSearch =
      o.id.toLowerCase().includes(s) ||
      o.customerName.toLowerCase().includes(s) ||
      o.customerEmail.toLowerCase().includes(s) ||
      o.customerPhone.includes(s);
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = async (newStatus: OrderStatus, paymentStatus?: PaymentStatus) => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      await updateOrderStatus(
        selectedOrder.id,
        newStatus,
        paymentStatus,
        statusNote.trim() || `Status updated to ${newStatus}`,
        currentUser?.email || 'Admin'
      );

      // Update local state
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              paymentStatus: paymentStatus || prev.paymentStatus,
            }
          : null
      );
      setStatusNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Pending</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'preparing':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">Preparing</span>;
      case 'ready':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">Ready</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">Out for Delivery</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Cancelled</span>;
    }
  };

  const customerPastOrders = inspectCustomerEmail
    ? orders.filter((o) => o.customerEmail === inspectCustomerEmail)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2.5 py-0.5 rounded-full">
            Operations & Fulfillment
          </span>
          <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900 mt-1">
            Customer Orders & Dispatch
          </h2>
          <p className="text-xs text-stone-500">
            Track kitchen preparation, dispatch drivers, and manage Cash on Delivery collections.
          </p>
        </div>

        <div className="text-right self-start sm:self-auto">
          <span className="text-xs text-stone-400 block">Total Database Orders</span>
          <span className="text-xl font-extrabold text-stone-900">{orders.length}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer, phone..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 text-stone-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {(
            [
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Pending' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'preparing', label: 'In Kitchen' },
              { id: 'ready', label: 'Ready' },
              { id: 'out_for_delivery', label: 'Out for Delivery' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === s.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Placed At</th>
                <th className="py-4 px-6">Dishes</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Order Status</th>
                <th className="py-4 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((order) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString('en-IE', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-6 font-extrabold font-mono text-stone-900 text-sm">
                      #{order.id}
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => setInspectCustomerEmail(order.customerEmail)}
                          className="font-bold text-stone-900 hover:text-orange-600 text-left block text-xs"
                          title="Click to view all orders by this customer"
                        >
                          {order.customerName}
                        </button>
                        <span className="text-[11px] text-stone-400 block">{order.customerPhone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-stone-500">{dateStr}</td>

                    <td className="py-4 px-6 font-medium text-stone-700">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      <span className="text-[10px] text-stone-400 block truncate max-w-[140px]">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-extrabold text-stone-900 text-sm">
                      €{order.total.toFixed(2)}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5 truncate max-w-[130px]">
                        {order.paymentMethod === 'Credit / Debit Card (Stripe)'
                          ? '💳 Stripe Card'
                          : '💵 Cash on Delivery'}
                      </span>
                    </td>

                    <td className="py-4 px-6">{getStatusBadge(order.status)}</td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-orange-600 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <p className="font-semibold text-stone-800">No orders match current criteria.</p>
            <p className="text-xs">Adjust your search or status filter to view orders.</p>
          </div>
        )}
      </div>

      {/* Order Details & Status Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-2xl text-stone-900 font-['Playfair_Display',serif]">
                    Order #{selectedOrder.id}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Delivery Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
              <div className="space-y-1.5">
                <span className="font-bold text-stone-500 uppercase text-[10px]">Customer</span>
                <p className="font-bold text-stone-900 text-sm">{selectedOrder.customerName}</p>
                <p className="text-stone-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <a href={`tel:${selectedOrder.customerPhone}`} className="hover:underline">
                    {selectedOrder.customerPhone}
                  </a>
                </p>
                <p className="text-stone-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{selectedOrder.customerEmail}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-stone-500 uppercase text-[10px]">Destination</span>
                <p className="text-stone-700 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span>{selectedOrder.deliveryAddress}</span>
                </p>
                {selectedOrder.deliveryInstructions && (
                  <p className="text-stone-500 italic">
                    Note: {selectedOrder.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>

            {/* Frozen Item Snapshots Table */}
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                Frozen Snapshot Items & Raw Costs
              </h4>
              <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Selling Price</th>
                      <th className="py-2.5 px-3">Raw Food Cost</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">{item.name}</td>
                        <td className="py-2.5 px-3">{item.quantity}</td>
                        <td className="py-2.5 px-3">€{item.sellingPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-stone-500">
                          €{(item.costPrice || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                          €{(item.sellingPrice * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600 pr-2">
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-800">
                    Payment Method:{' '}
                    <span className="text-orange-600 font-extrabold">{selectedOrder.paymentMethod}</span>
                  </span>
                  {selectedOrder.stripePaymentIntentId && (
                    <p className="text-[11px] font-mono text-stone-400">
                      Stripe Ref: {selectedOrder.stripePaymentIntentId}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span>Subtotal: €{selectedOrder.subtotal.toFixed(2)}</span>
                  <span>Delivery: €{selectedOrder.deliveryFee.toFixed(2)}</span>
                  <span className="font-extrabold text-stone-900 text-sm">
                    Total: €{selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Transition Control Actions */}
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Admin Lifecycle Transition Actions
              </h4>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('confirmed')}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs border border-blue-200 disabled:opacity-50"
                >
                  Confirm Order
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('preparing')}
                  className="px-3.5 py-2 rounded-xl bg-orange-50 text-orange-800 hover:bg-orange-100 font-bold text-xs border border-orange-200 disabled:opacity-50"
                >
                  Send to Kitchen
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('ready')}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold text-xs border border-purple-200 disabled:opacity-50"
                >
                  Mark as Ready
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('out_for_delivery')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  Dispatch to Driver
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('delivered', 'paid')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  Delivered & Cash Collected
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('cancelled')}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold text-xs border border-rose-200 disabled:opacity-50"
                >
                  Cancel Order
                </button>
              </div>

              {/* Cash Collection Control */}
              {selectedOrder.paymentStatus === 'unpaid' && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                  <span>Cash on Delivery is currently marked as UNPAID.</span>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.status, 'paid')}
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold"
                  >
                    Mark Payment as Collected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Orders History Modal */}
      {inspectCustomerEmail && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-stone-900 font-['Playfair_Display',serif]">
                  Customer Order History
                </h3>
                <p className="text-xs text-stone-400">{inspectCustomerEmail}</p>
              </div>
              <button
                onClick={() => setInspectCustomerEmail(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {customerPastOrders.map((o) => (
                <div key={o.id} className="p-3 rounded-2xl border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="font-mono text-stone-900">#{o.id}</span>
                    <span className="text-orange-600">€{o.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500 text-[11px]">
                    <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                    <span className="capitalize">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
