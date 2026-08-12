import { describe, it, expect } from 'vitest';
import { selectCheapestFlight } from '@/lib/search/selector';
import type { FlightDateResult } from '@/lib/providers/types';

describe('selectCheapestFlight', () => {
  it('returns null for empty array', () => {
    expect(selectCheapestFlight([])).toBeNull();
  });

  it('returns the single result when only one', () => {
    const results: FlightDateResult[] = [
      { departureDate: '2025-06-10', returnDate: '2025-06-12', price: { total: '100.00', currency: 'EUR' } },
    ];
    expect(selectCheapestFlight(results)).toEqual(results[0]);
  });

  it('returns the cheapest flight by total price', () => {
    const results: FlightDateResult[] = [
      { departureDate: '2025-06-10', returnDate: '2025-06-12', price: { total: '200.00', currency: 'EUR' } },
      { departureDate: '2025-06-11', returnDate: '2025-06-13', price: { total: '80.50', currency: 'GBP' } },
      { departureDate: '2025-06-12', returnDate: '2025-06-14', price: { total: '150.00', currency: 'EUR' } },
    ];
    const cheapest = selectCheapestFlight(results);
    expect(cheapest).toEqual(results[1]);
  });

  it('handles same-price flights deterministically (returns first)', () => {
    const results: FlightDateResult[] = [
      { departureDate: '2025-06-10', returnDate: '2025-06-12', price: { total: '100.00', currency: 'EUR' } },
      { departureDate: '2025-06-11', returnDate: '2025-06-13', price: { total: '100.00', currency: 'EUR' } },
    ];
    const cheapest = selectCheapestFlight(results);
    expect(cheapest).toEqual(results[0]);
  });
});
