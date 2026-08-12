import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exchangeRates } from '@/lib/db/schema';
import { config } from '@/lib/config';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = process.env.CRON_SECRET;
    if (authHeader && !process.env.VERCEL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    if (!config.exchangeRate.apiUrl) {
      return NextResponse.json({ error: 'Exchange rate API not configured' }, { status: 500 });
    }

    const url = config.exchangeRate.apiKey
      ? `${config.exchangeRate.apiUrl}/${config.exchangeRate.apiKey}/latest/EUR`
      : `${config.exchangeRate.apiUrl}/latest/EUR`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Exchange rate API returned ${res.status}`);
    }

    const data = await res.json();
    const rates = data.rates as Record<string, number>;

    const now = new Date().toISOString();

    for (const [currency, rate] of Object.entries(rates)) {
      const rateToEur = currency === 'EUR' ? 1 : 1 / rate;

      await db
        .insert(exchangeRates)
        .values({
          currency,
          rateToEur,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: exchangeRates.currency,
          set: { rateToEur, updatedAt: now },
        });
    }

    return NextResponse.json({ success: true, updated: Object.keys(rates).length });
  } catch (error) {
    console.error('Exchange rate refresh failed:', error);
    return NextResponse.json({ error: 'Failed to refresh exchange rates' }, { status: 500 });
  }
}
