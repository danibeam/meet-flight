import { describe, it, expect } from 'vitest';

function convertToEur(amount: number, rate: number): number {
  return amount * rate;
}

describe('Currency conversion', () => {
  it('converts USD to EUR using rate', () => {
    const usdAmount = 100;
    const usdToEurRate = 0.92;
    const eurAmount = convertToEur(usdAmount, usdToEurRate);
    expect(eurAmount).toBeCloseTo(92, 2);
  });

  it('converts GBP to EUR using rate', () => {
    const gbpAmount = 50;
    const gbpToEurRate = 1.17;
    const eurAmount = convertToEur(gbpAmount, gbpToEurRate);
    expect(eurAmount).toBeCloseTo(58.5, 2);
  });

  it('returns same amount when currency is already EUR (rate=1)', () => {
    const eurAmount = 200;
    const eurToEurRate = 1;
    const result = convertToEur(eurAmount, eurToEurRate);
    expect(result).toBe(200);
  });

  it('handles zero amount', () => {
    expect(convertToEur(0, 0.92)).toBe(0);
  });

  it('handles very large amounts', () => {
    const largeAmount = 99999;
    const rate = 0.85;
    expect(convertToEur(largeAmount, rate)).toBeCloseTo(84999.15, 2);
  });
});
