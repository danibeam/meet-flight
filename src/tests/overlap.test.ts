import { describe, it, expect } from 'vitest';
import { computeOverlap } from '@/lib/search/overlap';
import type { SelectedFlight } from '@/lib/search/selector';

describe('computeOverlap', () => {
  it('returns null for empty array', () => {
    const result = computeOverlap([]);
    expect(result.start).toBeNull();
    expect(result.end).toBeNull();
    expect(result.days).toBeNull();
  });

  it('returns the single flight range for one flight', () => {
    const flights: SelectedFlight[] = [
      { departureDate: '2025-06-10', returnDate: '2025-06-14', price: 100, currency: 'EUR' },
    ];
    const result = computeOverlap(flights);
    expect(result.start).toBe('2025-06-10');
    expect(result.end).toBe('2025-06-14');
    expect(result.days).toBe(5);
  });

  it('computes overlap when flights overlap', () => {
    const flights: SelectedFlight[] = [
      { departureDate: '2025-06-10', returnDate: '2025-06-14', price: 100, currency: 'EUR' },
      { departureDate: '2025-06-12', returnDate: '2025-06-16', price: 120, currency: 'EUR' },
    ];
    const result = computeOverlap(flights);
    expect(result.start).toBe('2025-06-12');
    expect(result.end).toBe('2025-06-14');
    expect(result.days).toBe(3);
  });

  it('returns null when no overlap', () => {
    const flights: SelectedFlight[] = [
      { departureDate: '2025-06-10', returnDate: '2025-06-12', price: 100, currency: 'EUR' },
      { departureDate: '2025-06-14', returnDate: '2025-06-16', price: 120, currency: 'EUR' },
    ];
    const result = computeOverlap(flights);
    expect(result.start).toBeNull();
    expect(result.end).toBeNull();
    expect(result.days).toBeNull();
  });

  it('computes overlap for 3+ travelers', () => {
    const flights: SelectedFlight[] = [
      { departureDate: '2025-06-10', returnDate: '2025-06-16', price: 100, currency: 'EUR' },
      { departureDate: '2025-06-12', returnDate: '2025-06-18', price: 120, currency: 'EUR' },
      { departureDate: '2025-06-11', returnDate: '2025-06-14', price: 110, currency: 'EUR' },
    ];
    const result = computeOverlap(flights);
    expect(result.start).toBe('2025-06-12');
    expect(result.end).toBe('2025-06-14');
    expect(result.days).toBe(3);
  });

  it('returns null if only partial overlap among 3', () => {
    const flights: SelectedFlight[] = [
      { departureDate: '2025-06-10', returnDate: '2025-06-12', price: 100, currency: 'EUR' },
      { departureDate: '2025-06-11', returnDate: '2025-06-14', price: 120, currency: 'EUR' },
      { departureDate: '2025-06-15', returnDate: '2025-06-18', price: 110, currency: 'EUR' },
    ];
    const result = computeOverlap(flights);
    expect(result.start).toBeNull();
    expect(result.days).toBeNull();
  });
});
