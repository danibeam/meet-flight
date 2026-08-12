import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { searches, travelers, destinations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { resolveSearch } from '@/lib/search/resolver';
import type { PairStatus } from '@/lib/search/resolver';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [search] = await db.select().from(searches).where(eq(searches.id, id)).limit(1);

    if (!search) {
      return NextResponse.json({ error: 'Search not found' }, { status: 404 });
    }

    let resultsMap = new Map<string, PairStatus>();

    if (search.resultsJson) {
      try {
        const parsed = JSON.parse(search.resultsJson) as Array<[string, PairStatus]>;
        resultsMap = new Map(parsed);
      } catch {
        resultsMap = new Map();
      }
    }

    if (search.status !== 'completed') {
      const resolveResult = await resolveSearch(id, resultsMap);
      return NextResponse.json({
        searchId: id,
        status: resolveResult.isComplete ? 'completed' : 'in_progress',
        results: resolveResult.results,
      });
    }

    const travelerRows = await db.select().from(travelers).where(eq(travelers.searchId, id));
    const destinationRows = await db.select().from(destinations).where(eq(destinations.searchId, id));

    const results = buildResponseResults(resultsMap, travelerRows, destinationRows);

    return NextResponse.json({
      searchId: id,
      status: 'completed',
      results,
    });
  } catch (error) {
    console.error('Failed to fetch results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

function buildResponseResults(
  resultsMap: Map<string, PairStatus>,
  travelerRows: Array<{ id: string; name: string; originCode: string | null; isLocal: boolean }>,
  destinationRows: Array<{ id: string; cityCode: string; cityName: string }>
) {
  return destinationRows.map((dest) => {
    const pairs = travelerRows.map((t) => resultsMap.get(`${t.id}:${dest.id}`)).filter(Boolean) as PairStatus[];

    const travelerResults = travelerRows.map((t) => {
      const pair = resultsMap.get(`${t.id}:${dest.id}`);
      return {
        travelerId: t.id,
        travelerName: t.name,
        originCode: t.originCode,
        isLocal: t.isLocal,
        status: pair?.status ?? 'pending',
        flight: pair?.flight
          ? {
              departureDate: pair.flight.departureDate,
              returnDate: pair.flight.returnDate,
              price: pair.flight.price,
              currency: pair.flight.currency,
            }
          : null,
        priceEur: pair?.flight?.priceEur ?? null,
      };
    });

    return {
      destinationId: dest.id,
      cityCode: dest.cityCode,
      cityName: dest.cityName,
      travelers: travelerResults,
      totalCostEur: pairs.some((p) => p.status === 'error' || p.status === 'pending')
        ? null
        : pairs.reduce((sum, p) => (p.flight ? sum + p.flight.priceEur : sum), 0),
      overlap: null,
    };
  });
}
