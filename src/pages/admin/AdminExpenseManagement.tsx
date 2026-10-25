import React, { useState } from 'react';
import {
  Plus,
  Receipt,
  Trash2,
  AlertCircle,
  Filter,
  DollarSign,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { addExpense, deleteExpense } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';

interface AdminExpenseManagementProps {
  expenses: Expense[];
}

const CATEGORIES: ExpenseCategory[] = [
  'Ingredients',
  'Utilities',
  'Salaries',
  'Rent',
  'Marketing',
  'Packaging',
  'Equipment',
  'Delivery',
  'Other',
];

export const AdminExpenseManagement: React.FC<AdminExpenseManagementProps> = ({ expenses }) => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Ingredients');
  const [formAmount, setFormAmount] = useState('150.00');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = expenses.filter(
    (e) => selectedCategory === 'All' || e.category === selectedCategory
  );

  const totalExpenseSum = filtered.reduce((acc, e) => acc + e.amount, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amount = parseFloat(formAmount);
    if (!formTitle.trim()) {
      setFormError('Expense title is required.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setSaving(true);
      await addExpense({
        title: formTitle.trim(),
        category: formCategory,
        amount: Number(amount.toFixed(2)),
        date: formDate,
        notes: formNotes.trim(),
        recordedBy: currentUser?.email || 'Admin',
      });
      setShowModal(false);
      setFormTitle('');
      setFormNotes('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to record expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense entry?')) return;
    try {
      setDeletingId(id);
      await deleteExpense(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2.5 py-0.5 rounded-full">
            Cost Accounting
          </span>
          <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900 mt-1">
            Operating Expense Ledger
          </h2>
          <p className="text-xs text-stone-500">
            Record supplier bills, utilities, wages, and kitchen equipment costs for net operating profit audit.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-md shadow-orange-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Category Filter & Total Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="md:col-span-4 bg-stone-900 text-white p-4 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
              Filtered Total
            </span>
            <span className="text-2xl font-extrabold text-amber-400">
              €{totalExpenseSum.toFixed(2)}
            </span>
          </div>
          <span className="text-xs text-stone-400">{filtered.length} entries</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-4 px-6">Expense Title</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Notes</th>
                <th className="py-4 px-6">Logged By</th>
                <th className="py-4 px-6 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-stone-900 text-sm">{exp.title}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold text-[11px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-stone-500">{exp.date}</td>
                  <td className="py-4 px-6 font-extrabold text-rose-600 text-sm">
                    €{exp.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-stone-500 max-w-xs truncate">
                    {exp.notes || '—'}
                  </td>
                  <td className="py-4 px-6 text-stone-400 text-[11px]">{exp.recordedBy || 'Admin'}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <p className="font-semibold text-stone-800">No recorded expenses found.</p>
            <p className="text-xs">Click "Record Expense" to log your restaurant operational bills.</p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-xl text-stone-900 font-['Playfair_Display',serif]">
                Record Restaurant Expense
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Organic Produce Supplier Invoice"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Amount (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Expense Date *
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Receipt Reference / Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Receipt # or supplier notes..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
