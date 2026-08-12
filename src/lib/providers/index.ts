import { config } from '@/lib/config';
import type { FlightSearchProvider } from './types';
import { MockProvider } from './mock-provider';

let providerInstance: FlightSearchProvider | null = null;

export function getProvider(): FlightSearchProvider {
  if (!providerInstance) {
    switch (config.flightProvider) {
      case 'mock':
        providerInstance = new MockProvider();
        break;
      case 'amadeus':
        throw new Error('Amadeus provider not yet implemented');
      default:
        providerInstance = new MockProvider();
    }
  }
  return providerInstance;
}
