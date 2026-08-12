import { db } from '@/lib/db';
import { exchangeRates } from '@/lib/db/schema';
import { config } from '@/lib/config';

const FALLBACK_RATES: Record<string, number> = {
  EUR: 1,
  USD: 0.92,
  GBP: 1.17,
  CHF: 1.05,
  JPY: 0.006,
  CAD: 0.68,
  AUD: 0.60,
  SEK: 0.087,
  NOK: 0.086,
  DKK: 0.134,
  PLN: 0.23,
  CZK: 0.039,
  HUF: 0.0025,
  CNY: 0.13,
  INR: 0.011,
  BRL: 0.17,
  MXN: 0.054,
  TRY: 0.029,
};

async function seedRates() {
  console.log('Seeding exchange rates...');

  let rates: Record<string, number> = FALLBACK_RATES;

  if (config.exchangeRate.apiUrl) {
    try {
      const url = config.exchangeRate.apiKey
        ? `${config.exchangeRate.apiUrl}/${config.exchangeRate.apiKey}/latest/EUR`
        : `${config.exchangeRate.apiUrl}/EUR`;

      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        const fetched = data.rates as Record<string, number>;
        rates = { EUR: 1 };
        for (const [currency, rate] of Object.entries(fetched)) {
          rates[currency] = 1 / rate;
        }
        console.log('Fetched live rates from API');
      }
    } catch (err) {
      console.log('Failed to fetch live rates, using fallback:', err);
    }
  }

  const now = new Date().toISOString();

  for (const [currency, rateToEur] of Object.entries(rates)) {
    await db
      .insert(exchangeRates)
      .values({ currency, rateToEur, updatedAt: now })
      .onConflictDoUpdate({
        target: exchangeRates.currency,
        set: { rateToEur, updatedAt: now },
      });
  }

  console.log(`Seeded ${Object.keys(rates).length} exchange rates.`);
}

seedRates().then(() => process.exit(0)).catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
