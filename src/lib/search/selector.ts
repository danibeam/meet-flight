import type { FlightDateResult } from '@/lib/providers/types';

export interface SelectedFlight {
  departureDate: string;
  returnDate: string;
  price: number;
  currency: string;
}

export interface TravelerResult {
  travelerId: string;
  travelerName: string;
  originCode: string | null;
  isLocal: boolean;
  status: 'resolved' | 'no_flights' | 'error' | 'pending';
  flight: SelectedFlight | null;
  priceEur: number | null;
}

export interface DestinationResult {
  destinationId: string;
  cityCode: string;
  cityName: string;
  travelers: TravelerResult[];
  totalCostEur: number | null;
  overlap: { start: string | null; end: string | null; days: number | null } | null;
}

export function selectCheapestFlight(results: FlightDateResult[]): FlightDateResult | null {
  if (results.length === 0) return null;
  return results.reduce((cheapest, current) =>
    parseFloat(current.price.total) < parseFloat(cheapest.price.total) ? current : cheapest
  );
}
