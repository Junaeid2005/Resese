import Stripe from 'stripe';

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

// Stripe secret key is read strictly from the server-side environment variable
const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
};

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'STRIPE_SECRET_KEY environment variable is not configured on Netlify.',
      }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { amount, currency = 'eur', customerEmail, orderId } = payload;

    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid payment amount is required' }),
      };
    }

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      }),
    };
  } catch (error: any) {
    console.error('Netlify Stripe Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Payment intent creation failed' }),
    };
  }
};
