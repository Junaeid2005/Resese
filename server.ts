import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Stripe secret key is read strictly from the server-side environment variable
const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
};

// Public API endpoint to provide the Stripe Publishable Key
app.get('/api/stripe-publishable-key', (req, res) => {
  res.json({
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  });
});

// Endpoint to create a PaymentIntent for Stripe Elements
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in your environment variables.',
      });
    }

    const { amount, currency = 'eur', customerEmail, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    // Amount in euro cents (e.g. €25.50 = 2550 cents)
    const amountInCents = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      receipt_email: customerEmail,
      metadata: {
        orderId: orderId || 'pending_order',
        restaurant: 'Savory Bite',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating Stripe PaymentIntent:', error);
    res.status(500).json({ error: error.message || 'Payment initiation failed' });
  }
});

// Full-Stack Server configuration with Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Savory Bite server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
