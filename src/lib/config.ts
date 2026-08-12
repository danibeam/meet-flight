function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

export const config = {
  flightProvider: process.env.FLIGHT_PROVIDER ?? 'mock',
  database: {
    url: required('TURSO_DATABASE_URL'),
    token: process.env.TURSO_AUTH_TOKEN || undefined,
  },
  amadeus: {
    baseUrl: process.env.AMADEUS_BASE_URL ?? 'https://test.api.amadeus.com',
    apiKey: process.env.AMADEUS_API_KEY,
    apiSecret: process.env.AMADEUS_API_SECRET,
  },
  exchangeRate: {
    apiUrl: process.env.EXCHANGE_RATE_API_URL,
    apiKey: process.env.EXCHANGE_RATE_API_KEY,
  },
  mock: {
    latencyMinMs: parseInt(process.env.MOCK_LATENCY_MIN_MS ?? '500'),
    latencyMaxMs: parseInt(process.env.MOCK_LATENCY_MAX_MS ?? '3000'),
    failureRate: parseFloat(process.env.MOCK_FAILURE_RATE ?? '0.1'),
  },
};
