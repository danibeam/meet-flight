import { db } from '@/lib/db';
import { searches, travelers, destinations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getProvider } from '@/lib/providers';
import { selectCheapestFlight } from './selector';
import { computeOverlap } from './overlap';
import { convertToEur } from './currency';
import type { DestinationResult, TravelerResult } from './selector';

const SOFT_DEADLINE_MS = 7000;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

export interface PairStatus {
  travelerId: string;
  destinationId: string;
  status: 'pending' | 'resolved' | 'no_flights' | 'error';
  flight: {
    departureDate: string;
    returnDate: string;
    price: number;
    currency: string;
    priceEur: number;
  } | null;
}

type ResultsMap = Map<string, PairStatus>;

export interface ResolveResult {
  results: DestinationResult[];
  isComplete: boolean;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<{ success: true; data: T } | { success: false }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await fn();
      return { success: true, data };
    } catch {
      if (attempt === retries) return { success: false };
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt] ?? 4000));
    }
  }
  return { success: false };
}

export async function resolveSearch(
  searchId: string,
  existingResults: ResultsMap
): Promise<ResolveResult> {
  const startTime = Date.now();

  const [search] = await db
    .select()
    .from(searches)
    .where(eq(searches.id, searchId))
    .limit(1);

  if (!search) throw new Error(`Search ${searchId} not found`);

  if (search.status === 'completed') {
    return buildResults(existingResults);
  }

  if (search.status === 'pending') {
    await db
      .update(searches)
      .set({ status: 'in_progress' })
      .where(eq(searches.id, searchId));
  }

  const travelerRows = await db
    .select()
    .from(travelers)
    .where(eq(travelers.searchId, searchId));

  const destinationRows = await db
    .select()
    .from(destinations)
    .where(eq(destinations.searchId, searchId));

  const provider = getProvider();

  for (const traveler of travelerRows) {
    for (const destination of destinationRows) {
      const pairKey = `${traveler.id}:${destination.id}`;

      if (existingResults.has(pairKey) && existingResults.get(pairKey)!.status !== 'pending') {
        continue;
      }

      if (Date.now() - startTime > SOFT_DEADLINE_MS) {
        return buildResults(existingResults);
      }

      if (traveler.isLocal || !traveler.originCode) {
        existingResults.set(pairKey, {
          travelerId: traveler.id,
          destinationId: destination.id,
          status: 'resolved',
          flight: null,
        });
        continue;
      }

      const result = await retryWithBackoff(() =>
        provider.searchCheapestDates({
          origin: traveler.originCode!,
          destination: destination.cityCode,
          departureDateRange: `${search.dateRangeStart},${search.dateRangeEnd}`,
          duration: `${search.durationMin},${search.durationMax}`,
          nonStop: search.nonStop,
        })
      );

      if (!result.success) {
        existingResults.set(pairKey, {
          travelerId: traveler.id,
          destinationId: destination.id,
          status: 'error',
          flight: null,
        });
      } else {
        const cheapest = selectCheapestFlight(result.data);
        if (!cheapest) {
          existingResults.set(pairKey, {
            travelerId: traveler.id,
            destinationId: destination.id,
            status: 'no_flights',
            flight: null,
          });
        } else {
          const price = parseFloat(cheapest.price.total);
          const priceEur = await convertToEur(price, cheapest.price.currency);

          existingResults.set(pairKey, {
            travelerId: traveler.id,
            destinationId: destination.id,
            status: 'resolved',
            flight: {
              departureDate: cheapest.departureDate,
              returnDate: cheapest.returnDate,
              price,
              currency: cheapest.price.currency,
              priceEur,
            },
          });
        }
      }
    }
  }

  const isComplete = travelerRows.every((t) =>
    destinationRows.every((d) => {
      const pair = existingResults.get(`${t.id}:${d.id}`);
      return pair && pair.status !== 'pending';
    })
  );

  if (isComplete) {
    await db
      .update(searches)
      .set({ status: 'completed', resolvedAt: new Date().toISOString() })
      .where(eq(searches.id, searchId));
  }

  const { results } = buildResults(existingResults);

  await db
    .update(searches)
    .set({ resultsJson: JSON.stringify(results) })
    .where(eq(searches.id, searchId));

  return { results, isComplete };
}

function buildResults(resultsMap: ResultsMap): ResolveResult {
  const byDestination = new Map<string, PairStatus[]>();

  for (const pair of resultsMap.values()) {
    const list = byDestination.get(pair.destinationId) ?? [];
    list.push(pair);
    byDestination.set(pair.destinationId, list);
  }

  const destinationResults: DestinationResult[] = [];

  for (const [destinationId, pairs] of byDestination) {
    const firstPair = pairs[0];
    if (!firstPair) continue;

    const travelerResults: TravelerResult[] = pairs.map((p) => ({
      travelerId: p.travelerId,
      travelerName: '',
      originCode: null,
      isLocal: false,
      status: p.status,
      flight: p.flight
        ? {
            departureDate: p.flight.departureDate,
            returnDate: p.flight.returnDate,
            price: p.flight.price,
            currency: p.flight.currency,
          }
        : null,
      priceEur: p.flight?.priceEur ?? null,
    }));

    const resolvedFlights = pairs
      .filter((p) => p.flight !== null)
      .map((p) => ({
        departureDate: p.flight!.departureDate,
        returnDate: p.flight!.returnDate,
        price: p.flight!.price,
        currency: p.flight!.currency,
      }));

    const overlap =
      resolvedFlights.length > 0 ? computeOverlap(resolvedFlights) : { start: null, end: null, days: null };

    const totalCostEur = pairs.reduce(
      (sum, p) => (p.flight ? sum + p.flight.priceEur : sum),
      0
    );

    destinationResults.push({
      destinationId,
      cityCode: '',
      cityName: '',
      travelers: travelerResults,
      totalCostEur: pairs.some((p) => p.status === 'error' || p.status === 'pending') ? null : totalCostEur,
      overlap,
    });
  }

  return { results: destinationResults, isComplete: false };
}
