interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const publishableKey =
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_51UTlSkRTde7keUD9GjG77bp3XQ19q6QWb2WvA9ZHBUxrMSmGvgwPEHcJ34cu9RK7ytJFGoM515PM8TSGkECUorTS00BpLmsBs4';

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ publishableKey }),
  };
};
