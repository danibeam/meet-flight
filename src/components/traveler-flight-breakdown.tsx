import { cn } from '@/lib/utils';

interface TravelerFlightInfo {
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
}

export function TravelerFlightBreakdown({ traveler }: { traveler: TravelerFlightInfo }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md px-3 py-2 text-sm',
        traveler.status === 'error' && 'bg-red-50',
        traveler.status === 'no_flights' && 'bg-gray-50',
        traveler.status === 'resolved' && 'bg-green-50',
        traveler.status === 'pending' && 'bg-yellow-50'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{traveler.travelerName || 'Unknown'}</span>
        {!traveler.isLocal && traveler.originCode && (
          <span className="text-gray-500">from {traveler.originCode}</span>
        )}
        {traveler.isLocal && (
          <span className="text-gray-500">(local)</span>
        )}
      </div>

      <div className="text-right">
        {traveler.status === 'pending' && (
          <span className="text-yellow-600">Resolving...</span>
        )}
        {traveler.status === 'error' && (
          <span className="text-red-600">Error</span>
        )}
        {traveler.status === 'no_flights' && (
          <span className="text-gray-500">N/A</span>
        )}
        {traveler.status === 'resolved' && traveler.flight && (
          <div>
            <div className="font-medium text-gray-900">
              €{traveler.priceEur?.toFixed(0) ?? '—'}
            </div>
            <div className="text-xs text-gray-500">
              {traveler.flight.departureDate} → {traveler.flight.returnDate}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
