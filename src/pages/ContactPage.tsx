import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { RestaurantSettings } from '../types';

interface ContactPageProps {
  settings: RestaurantSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Table Reservation / General Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 bg-orange-100/70 px-3.5 py-1 rounded-full inline-block">
          We'd Love to Hear From You
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-['Playfair_Display',serif] text-stone-900">
          Contact & Dining Reservations
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Have an inquiry regarding catering, dietary allergens, or dine-in reservations? Reach out to our hospitality team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-6">
            <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-stone-900 border-b border-stone-100 pb-3">
              Restaurant Details
            </h2>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Address</p>
                  <p className="text-stone-600 mt-0.5">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Phone Line</p>
                  <a href={`tel:${settings.phone}`} className="text-stone-600 hover:text-orange-600 block mt-0.5">
                    {settings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Customer Support</p>
                  <a href={`mailto:${settings.email}`} className="text-stone-600 hover:text-orange-600 block mt-0.5">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">Service Hours</p>
                  <p className="text-stone-600 mt-0.5">{settings.openingHours}</p>
                  <p className="text-xs text-stone-400 mt-1">Delivery available during all service hours.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Visual Mock */}
          <div className="rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs relative bg-stone-100 h-52">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
              alt="Map Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-2xs flex items-center justify-center p-4 text-center">
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl max-w-xs space-y-1">
                <p className="font-bold text-stone-900 text-xs">Savory Bite Bistro & Kitchen</p>
                <p className="text-[11px] text-stone-500">Temple Bar, Central Dublin</p>
                <span className="text-[10px] text-orange-600 font-extrabold uppercase tracking-wider block pt-1">
                  Valet & Street Parking Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message / Reservation Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-stone-900">
              Send Us a Note
            </h2>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Message Sent Successfully</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Thank you! Our restaurant manager will review your note and respond via email within 2 to 4 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Liam Smith"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="liam@example.com"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Subject / Inquiry Type
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-stone-900 font-medium"
                >
                  <option value="Table Reservation / General Inquiry">Table Reservation / Dining Inquiry</option>
                  <option value="Catering & Events">Private Event & Office Catering</option>
                  <option value="Dietary Allergens">Allergens & Nutritional Inquiries</option>
                  <option value="Delivery Feedback">Order & Delivery Feedback</option>
                  <option value="Other">Other Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Message Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist your culinary experience today?"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-stone-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-sm shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Transmit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
