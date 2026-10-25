import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Copy,
  Terminal,
  Server,
  UserPlus,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BOOTSTRAP_ADMIN_EMAIL } from '../../services/dbService';

export const AdminSecurityGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUid, setNewAdminUid] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminNotice(null);
    if (!newAdminEmail.trim() || !newAdminUid.trim()) {
      setAdminNotice('Both User Email and User UID are required.');
      return;
    }
    try {
      setAddingAdmin(true);
      await setDoc(doc(db, 'admins', newAdminUid.trim()), {
        userId: newAdminUid.trim(),
        email: newAdminEmail.trim(),
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
      setAdminNotice(`Success: Admin status granted to ${newAdminEmail}`);
      setNewAdminEmail('');
      setNewAdminUid('');
    } catch (err: any) {
      setAdminNotice(`Error: ${err.message}`);
    } finally {
      setAddingAdmin(false);
    }
  };

  const nodeScriptExample = `// Script to assign Firebase Custom Claims (admin role)
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminRole(targetUid) {
  await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });
  console.log('Admin claim successfully attached to UID:', targetUid);
}

// Replace with customer UID
setAdminRole('TARGET_USER_UID');`;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2.5 py-0.5 rounded-full">
          Architecture & Hardening
        </span>
        <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-stone-900 mt-1">
          Role-Based Security, Claims & Netlify Guide
        </h2>
        <p className="text-xs text-stone-500">
          How Savory Bite enforces multi-tiered security, prevents client-side role tampering, and deploys securely to Netlify.
        </p>
      </div>

      {/* Grant Administrator Role to another user */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-base font-['Playfair_Display',serif]">
          <UserPlus className="w-5 h-5 text-orange-600" />
          <span>Grant Admin Role to Another Staff Member</span>
        </div>
        <p className="text-xs text-stone-500">
          Authorized administrators can register secondary admin accounts by adding their Firebase UID to the secure <code>/admins</code> collection.
        </p>

        {adminNotice && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            {adminNotice}
          </div>
        )}

        <form onSubmit={handleGrantAdmin} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="manager@savorybite.com"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
              User UID (from Firebase Auth)
            </label>
            <input
              type="text"
              required
              value={newAdminUid}
              onChange={(e) => setNewAdminUid(e.target.value)}
              placeholder="e.g. 8kEw29mX9..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={addingAdmin}
              className="w-full py-2 px-4 bg-stone-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              {addingAdmin ? 'Authorizing...' : 'Grant Admin Privileges'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Architecture Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900 font-['Playfair_Display',serif]">
            1. Zero-Trust Access Boundary
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            The frontend React application NEVER acts as a security perimeter. Client-side URL manipulation or localStorage tampering cannot bypass Firestore Security Rules.
          </p>
          <ul className="text-xs text-stone-500 space-y-1.5 list-disc pl-4 pt-1">
            <li>Customer carts are isolated to <code>request.auth.uid == userId</code>.</li>
            <li>Operational expenses are invisible and unreadable by ordinary customers.</li>
            <li>Order cost snapshots are immutable and cannot be rewritten.</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900 font-['Playfair_Display',serif]">
            2. First Admin Bootstrapping
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            The initial root administrator is pinned to <strong>{BOOTSTRAP_ADMIN_EMAIL}</strong> in Firestore security rules and backend code.
          </p>
          <p className="text-xs text-stone-500 leading-relaxed">
            Upon authenticating via Google or Email with this verified address, the system grants immediate superadmin privileges and seeds the <code>/admins</code> collection document.
          </p>
        </div>
      </div>

      {/* Production Custom Claims Script */}
      <div className="bg-stone-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-stone-200 uppercase tracking-wider">
              Firebase Admin SDK Custom Claims Snippet
            </h3>
          </div>
          <button
            onClick={() => handleCopyCode(nodeScriptExample)}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 bg-stone-950 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto">
          {nodeScriptExample}
        </pre>
      </div>

      {/* Netlify Deployment Step-by-Step */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-stone-900 font-['Playfair_Display',serif] text-base">
          <Globe className="w-5 h-5 text-orange-600" />
          <span>Netlify Production Deployment Steps</span>
        </div>

        <div className="space-y-3 text-xs text-stone-600">
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <strong className="text-stone-900 block">Step 1: Build & Output Directories</strong>
            <p>Netlify builds via <code>npm run build</code> and publishes the <code>dist</code> folder.</p>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <strong className="text-stone-900 block">Step 2: Single Page Application Routing (SPA)</strong>
            <p>Our <code>netlify.toml</code> includes the rewrite rule <code>/* /index.html 200</code> so all customer and admin routes reload smoothly.</p>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <strong className="text-stone-900 block">Step 3: Firebase Console Authorized Domains</strong>
            <p>
              In Firebase Console → Authentication → Settings → Authorized domains, add your Netlify custom domain (e.g. <code>savory-bite.netlify.app</code>) to enable Google Sign-In and popup authentication.
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <strong className="text-stone-900 block">Step 4: Email Verification Flow</strong>
            <p>
              Enable Email/Password in Firebase Console → Authentication → Sign-in method. Firebase will send verification emails with secure action URLs automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
