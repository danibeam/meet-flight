import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { airports } from '@/lib/db/schema';
import { or, ilike } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');

    if (!q || q.trim().length < 2) {
      return NextResponse.json([]);
    }

    const pattern = `%${q.trim().toUpperCase()}%`;

    const results = await db
      .select()
      .from(airports)
      .where(
        or(
          ilike(airports.code, pattern),
          ilike(airports.name, pattern),
          ilike(airports.cityName, pattern)
        )
      )
      .limit(15);

    const seen = new Set<string>();
    const deduped = results.filter((r) => {
      if (seen.has(r.code)) return false;
      seen.add(r.code);
      return true;
    });

    return NextResponse.json(deduped);
  } catch (error) {
    console.error('Airport autocomplete error:', error);
    return NextResponse.json({ error: 'Failed to search airports' }, { status: 500 });
  }
}
