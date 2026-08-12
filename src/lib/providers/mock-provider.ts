import type { FlightSearchProvider, FlightDateResult } from './types';

function getEnvInt(key: string, fallback: number): number {
  const val = process.env[key];
  return val ? parseInt(val) : fallback;
}

function getEnvFloat(key: string, fallback: number): number {
  const val = process.env[key];
  return val ? parseFloat(val) : fallback;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export class MockProvider implements FlightSearchProvider {
  private latencyMinMs: number;
  private latencyMaxMs: number;
  private failureRate: number;

  constructor() {
    this.latencyMinMs = getEnvInt('MOCK_LATENCY_MIN_MS', 500);
    this.latencyMaxMs = getEnvInt('MOCK_LATENCY_MAX_MS', 3000);
    this.failureRate = getEnvFloat('MOCK_FAILURE_RATE', 0.1);
  }

  async searchCheapestDates(params: {
    origin: string;
    destination: string;
    departureDateRange: string;
    duration: string;
    nonStop: boolean;
  }): Promise<FlightDateResult[]> {
    const delay = this.latencyMinMs + Math.random() * (this.latencyMaxMs - this.latencyMinMs);
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (Math.random() < this.failureRate) {
      throw new Error(`Mock failure for ${params.origin} → ${params.destination}`);
    }

    const seed = hashString(
      `${params.origin}-${params.destination}-${params.departureDateRange}-${params.duration}`
    );

    const [startStr, endStr] = params.departureDateRange.split(',');
    const [durMinStr, durMaxStr] = params.duration.split(',');
    const durMin = durMinStr ? parseInt(durMinStr) : 2;
    const durMax = durMaxStr ? parseInt(durMaxStr) : 4;

    if (!startStr || !endStr) return [];

    const start = new Date(startStr);
    const end = new Date(endStr);
    const daySpan = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const numResults = 3 + Math.floor(seededRandom(seed) * 5);
    const results: FlightDateResult[] = [];

    for (let i = 0; i < numResults; i++) {
      const dayOffset = 1 + Math.floor(seededRandom(seed + i) * Math.max(daySpan - durMax, 0));
      const departure = new Date(start);
      departure.setDate(departure.getDate() + dayOffset);

      const duration = durMin + Math.floor(seededRandom(seed + i * 7) * (durMax - durMin + 1));
      const ret = new Date(departure);
      ret.setDate(ret.getDate() + duration);

      const basePrice = 50 + seededRandom(seed + i * 13) * 450;
      const price = params.nonStop ? basePrice * 1.3 : basePrice;

      results.push({
        departureDate: departure.toISOString().split('T')[0]!,
        returnDate: ret.toISOString().split('T')[0]!,
        price: {
          total: price.toFixed(2),
          currency: ['EUR', 'GBP', 'USD'][Math.floor(seededRandom(seed + i * 3) * 3)]!,
        },
      });
    }

    return results.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
  }
}
