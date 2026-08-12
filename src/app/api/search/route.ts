import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { searches, travelers, destinations } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      dateRangeStart,
      dateRangeEnd,
      durationMin = 2,
      durationMax = 4,
      nonStop = false,
      travelers: travelerInputs = [],
      destinations: destinationInputs = [],
    } = body;

    if (!dateRangeStart || !dateRangeEnd) {
      return NextResponse.json({ error: 'Date range is required' }, { status: 400 });
    }

    if (!travelerInputs || travelerInputs.length === 0) {
      return NextResponse.json({ error: 'At least 1 traveler is required' }, { status: 400 });
    }

    if (travelerInputs.length > 6) {
      return NextResponse.json({ error: 'Maximum 6 travelers allowed' }, { status: 400 });
    }

    if (!destinationInputs || destinationInputs.length === 0) {
      return NextResponse.json({ error: 'At least 1 destination is required' }, { status: 400 });
    }

    if (destinationInputs.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 destinations allowed' }, { status: 400 });
    }

    const searchId = nanoid(12);

    await db.insert(searches).values({
      id: searchId,
      status: 'pending',
      dateRangeStart,
      dateRangeEnd,
      durationMin,
      durationMax,
      nonStop,
    });

    const travelerRows = travelerInputs.map((t: { name: string; originCode?: string; isLocal?: boolean }) => ({
      id: nanoid(12),
      searchId,
      name: t.name,
      originCode: t.isLocal ? null : (t.originCode ?? null),
      isLocal: t.isLocal ?? false,
    }));

    if (travelerRows.length > 0) {
      await db.insert(travelers).values(travelerRows);
    }

    const destinationRows = destinationInputs.map(
      (d: { cityCode: string; cityName: string }) => ({
        id: nanoid(12),
        searchId,
        cityCode: d.cityCode,
        cityName: d.cityName,
      })
    );

    if (destinationRows.length > 0) {
      await db.insert(destinations).values(destinationRows);
    }

    return NextResponse.json({ id: searchId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create search:', error);
    return NextResponse.json({ error: 'Failed to create search' }, { status: 500 });
  }
}
