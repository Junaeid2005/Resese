import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Building2, Phone, Mail, MapPin, Clock, Truck, Sparkles } from 'lucide-react';
import { RestaurantSettings } from '../../types';
import { updateRestaurantSettings } from '../../services/dbService';

interface AdminSettingsManagementProps {
  settings: RestaurantSettings;
}

export const AdminSettingsManagement: React.FC<AdminSettingsManagementProps> = ({ settings }) => {
  const [restaurantName, setRestaurantName] = useState(settings.restaurantName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [description, setDescription] = useState(settings.description);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [openingHours, setOpeningHours] = useState(settings.openingHours);
  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFee.toString());
  const [promoBannerText, setPromoBannerText] = useState(settings.promoBannerText);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    const fee = parseFloat(deliveryFee);
    if (!restaurantName.trim()) {
      setError('Restaurant name is required.');
      return;
    }
    if (isNaN(fee) || fee < 0) {
      setError('Please provide a valid delivery fee (can be 0 or higher).');
      return;
    }

    try {
      setSaving(true);
      await updateRestaurantSettings({
        restaurantName: restaurantName.trim(),
        logoUrl: logoUrl.trim(),
        description: description.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        openingHours: openingHours.trim(),
        deliveryFee: Number(fee.toFixed(2)),
        promoBannerText: promoBannerText.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings to Firestore');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2.5 py-0.5 rounded-full">
          Global Profile
        </span>
        <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900 mt-1">
          Restaurant Branding & Settings
        </h2>
        <p className="text-xs text-stone-500">
          Configure publicly displayed trade information, opening schedule, delivery charge, and header promotional notices.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Restaurant profile and settings updated successfully in Firestore!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Restaurant Brand Name *</span>
            </label>
            <input
              type="text"
              required
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-orange-600" />
              <span>Standard Delivery Fee (€) *</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Top Promotional Announcement Text</span>
          </label>
          <input
            type="text"
            value={promoBannerText}
            onChange={(e) => setPromoBannerText(e.target.value)}
            placeholder="e.g. Free Chef Garlic Bread on orders over €25!"
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Restaurant Bio & Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-600" />
              <span>Contact Phone</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-orange-600" />
              <span>Public Support Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Physical Address</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span>Opening Hours Schedule</span>
            </label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Restaurant Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
