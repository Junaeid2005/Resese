import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface StripeCardFormProps {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isProcessing: boolean;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onError: (errorMessage: string) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1c1917',
      fontFamily: '"Plus Jakarta Sans", -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#a8a29e',
      },
      iconColor: '#ea580c',
    },
    invalid: {
      color: '#e11d48',
      iconColor: '#e11d48',
    },
  },
  hidePostalCode: true,
};

export const StripeCardForm: React.FC<StripeCardFormProps> = ({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  isProcessing,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      onError('Stripe is still loading. Please wait a moment and try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card input is not available.');
      return;
    }

    try {
      setSubmitting(true);
      setCardError(null);

      // 1. Request clientSecret from secure backend
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'eur',
          customerEmail,
          metadata: {
            customerName,
            customerPhone,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to initiate secure payment');
      }

      const { clientSecret, id: intentId } = await res.json();

      // 2. Confirm card payment securely through Stripe SDK
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName || 'Valued Diner',
            email: customerEmail || undefined,
            phone: customerPhone || undefined,
          },
        },
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message || 'Payment was declined by card issuer');
      }

      if (paymentResult.paymentIntent && paymentResult.paymentIntent.status === 'succeeded') {
        // 3. Delegate to caller to create order in Firestore with paid status
        await onSuccess(paymentResult.paymentIntent.id);
      } else {
        throw new Error('Payment was not completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Stripe payment error:', err);
      const msg = err.message || 'Payment failed';
      setCardError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isProcessing || submitting;

  return (
    <div className="space-y-4">
      {/* Stripe Card Input Box */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-orange-600" />
            <span>Card Information</span>
          </label>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-semibold">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>End-to-End Encrypted (PCI-DSS)</span>
          </div>
        </div>

        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 focus-within:bg-white transition-all">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => {
              if (e.error) {
                setCardError(e.error.message);
              } else {
                setCardError(null);
              }
            }}
          />
        </div>

        {cardError && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{cardError}</span>
          </div>
        )}
      </div>

      {/* Test Mode Helper Info */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1">
        <div className="flex items-center justify-between font-bold">
          <span>Stripe Test Mode Active</span>
          <span className="font-mono text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded">
            Card: 4242 4242 4242 4242
          </span>
        </div>
        <p className="text-amber-800 text-[10px] leading-relaxed">
          Use any future expiration (e.g. 12/30) and any 3-digit CVC (e.g. 123) to simulate a successful payment.
        </p>
      </div>

      <button
        type="button"
        disabled={busy || !stripe}
        onClick={handleCardPayment}
        className={`w-full py-4 rounded-2xl font-extrabold text-base shadow-lg flex items-center justify-center gap-2 transition-all ${
          busy || !stripe
            ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-orange-600/30'
        }`}
      >
        {busy ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Authorizing Payment via Stripe (€{amount.toFixed(2)})...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Pay €{amount.toFixed(2)} with Card</span>
          </>
        )}
      </button>
    </div>
  );
};
