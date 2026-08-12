import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { searches } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [search] = await db.select().from(searches).where(eq(searches.id, id)).limit(1);

    if (!search) {
      return NextResponse.json({ error: 'Search not found' }, { status: 404 });
    }

    await db
      .update(searches)
      .set({
        status: 'in_progress',
        resultsJson: null,
        resolvedAt: null,
      })
      .where(eq(searches.id, id));

    return NextResponse.json({ id, status: 'in_progress' });
  } catch (error) {
    console.error('Failed to refresh search:', error);
    return NextResponse.json({ error: 'Failed to refresh search' }, { status: 500 });
  }
}
