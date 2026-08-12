import { db } from '@/lib/db';
import { exchangeRates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const rateCache = new Map<string, { rate: number; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getRate(currency: string): Promise<number> {
  if (currency === 'EUR') return 1;

  const cached = rateCache.get(currency);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rate;
  }

  const [row] = await db
    .select({ rateToEur: exchangeRates.rateToEur })
    .from(exchangeRates)
    .where(eq(exchangeRates.currency, currency))
    .limit(1);

  if (!row) {
    console.warn(`No exchange rate found for ${currency}, assuming 1:1`);
    return 1;
  }

  rateCache.set(currency, { rate: row.rateToEur, fetchedAt: Date.now() });
  return row.rateToEur;
}

export async function convertToEur(amount: number, currency: string): Promise<number> {
  const rate = await getRate(currency);
  return amount * rate;
}
