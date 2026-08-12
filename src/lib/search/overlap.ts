import type { SelectedFlight } from './selector';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangeAndDays extends DateRange {
  days: number;
}

export interface OverlapResult {
  start: string | null;
  end: string | null;
  days: number | null;
}

function toDateRange(flight: SelectedFlight): DateRangeAndDays {
  const start = flight.departureDate;
  const end = flight.returnDate;
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return { start, end, days };
}

function dateOverlap(a: DateRange, b: DateRange): DateRangeAndDays | null {
  const start = new Date(Math.max(new Date(a.start).getTime(), new Date(b.start).getTime()));
  const end = new Date(Math.min(new Date(a.end).getTime(), new Date(b.end).getTime()));

  if (start <= end) {
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return {
      start: start.toISOString().split('T')[0]!,
      end: end.toISOString().split('T')[0]!,
      days,
    };
  }
  return null;
}

export function computeOverlap(flights: SelectedFlight[]): OverlapResult {
  if (flights.length === 0) return { start: null, end: null, days: null };

  const ranges = flights.map(toDateRange);
  let current = ranges[0]!;

  for (let i = 1; i < ranges.length; i++) {
    const overlap = dateOverlap(current, ranges[i]!);
    if (!overlap) return { start: null, end: null, days: null };
    current = overlap;
  }

  return { start: current.start, end: current.end, days: current.days };
}
