import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TravelerFlightBreakdown } from './traveler-flight-breakdown';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';

interface ResultCardProps {
  cityName: string;
  cityCode: string;
  totalCostEur: number | null;
  overlap: { start: string | null; end: string | null; days: number | null } | null;
  travelers: Array<{
    travelerId: string;
    travelerName: string;
    originCode: string | null;
    isLocal: boolean;
    status: string;
    flight: {
      departureDate: string;
      returnDate: string;
      price: number;
      currency: string;
    } | null;
    priceEur: number | null;
  }>;
  rank: number;
}

export function ResultCard({
  cityName,
  cityCode,
  totalCostEur,
  overlap,
  travelers,
  rank,
}: ResultCardProps) {
  const allResolved = travelers.every((t) => t.status === 'resolved');
  const anyError = travelers.some((t) => t.status === 'error');
  const anyPending = travelers.some((t) => t.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">#{rank}</span>
            {cityName}
            <span className="text-sm font-normal text-gray-400">({cityCode})</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {allResolved && totalCostEur !== null && (
              <Badge variant="default" className="text-base font-semibold">
                €{totalCostEur.toFixed(0)}
              </Badge>
            )}
            {anyError && <Badge variant="destructive">Partial error</Badge>}
            {anyPending && <Badge variant="secondary">Loading...</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {overlap && overlap.days && overlap.start && overlap.end && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            Everyone together: {overlap.start} → {overlap.end} ({overlap.days} days)
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide">
            <Users className="h-3 w-3" />
            Per traveler
          </div>
          {travelers.map((t) => (
            <TravelerFlightBreakdown key={t.travelerId} traveler={t} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
