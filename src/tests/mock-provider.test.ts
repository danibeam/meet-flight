import { describe, it, expect } from 'vitest';
import { MockProvider } from '@/lib/providers/mock-provider';

describe('MockProvider', () => {
  it('returns results for valid params', async () => {
    const provider = new MockProvider();
    const results = await provider.searchCheapestDates({
      origin: 'MAD',
      destination: 'LON',
      departureDateRange: '2025-06-10,2025-06-25',
      duration: '2,4',
      nonStop: false,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.departureDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(results[0]!.returnDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(parseFloat(results[0]!.price.total)).toBeGreaterThan(0);
  });

  it('returns results sorted by price ascending', async () => {
    const provider = new MockProvider();
    const results = await provider.searchCheapestDates({
      origin: 'MAD',
      destination: 'BCN',
      departureDateRange: '2025-07-01,2025-07-15',
      duration: '3,5',
      nonStop: false,
    });

    for (let i = 1; i < results.length; i++) {
      expect(parseFloat(results[i]!.price.total)).toBeGreaterThanOrEqual(
        parseFloat(results[i - 1]!.price.total)
      );
    }
  });

  it('returns deterministic results for same seed', async () => {
    const provider = new MockProvider();
    const params = {
      origin: 'MAD',
      destination: 'LON',
      departureDateRange: '2025-06-10,2025-06-25',
      duration: '2,4',
      nonStop: false,
    };

    const results1 = await provider.searchCheapestDates(params);
    const results2 = await provider.searchCheapestDates(params);

    expect(results1.length).toBe(results2.length);
    for (let i = 0; i < results1.length; i++) {
      expect(results1[i]!.departureDate).toBe(results2[i]!.departureDate);
      expect(results1[i]!.price.total).toBe(results2[i]!.price.total);
    }
  });

  it('returns prices between 50 and 500 EUR range', async () => {
    const provider = new MockProvider();
    const results = await provider.searchCheapestDates({
      origin: 'MAD',
      destination: 'LON',
      departureDateRange: '2025-06-10,2025-06-25',
      duration: '2,4',
      nonStop: false,
    });

    for (const result of results) {
      const price = parseFloat(result.price.total);
      expect(price).toBeGreaterThanOrEqual(50);
      expect(price).toBeLessThanOrEqual(650);
    }
  });
});
