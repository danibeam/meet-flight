'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ResultCard } from '@/components/result-card';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TravelerFlight {
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

interface DestinationResult {
  destinationId: string;
  cityCode: string;
  cityName: string;
  totalCostEur: number | null;
  overlap: { start: string | null; end: string | null; days: number | null } | null;
  travelers: TravelerFlight[];
}

interface SearchResponse {
  searchId: string;
  status: 'pending' | 'in_progress' | 'completed';
  results: DestinationResult[];
}

export default function ResultsPage() {
  const params = useParams();
  const searchId = params.id as string;

  const [data, setData] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreator] = useState(() => {
    if (typeof window === 'undefined') return false;
    const created = JSON.parse(localStorage.getItem('created_searches') ?? '[]') as string[];
    return created.includes(searchId);
  });

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/search/${searchId}/results`);
      if (!res.ok) throw new Error('Failed to fetch results');
      const json: SearchResponse = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Polling error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch updates state after completion, not synchronously
    fetchResults();
  }, [searchId, fetchResults]);

  useEffect(() => {
    if (!data || data.status === 'completed') return;

    const interval = setInterval(fetchResults, 2000);
    return () => clearInterval(interval);
  }, [data, fetchResults]);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await fetch(`/api/search/${searchId}/refresh`, { method: 'POST' });
      await fetchResults();
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="text-gray-500">Search not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/search"><ArrowLeft className="mr-2 h-4 w-4" /> New search</Link>
        </Button>
      </div>
    );
  }

  const sortedResults = [...data.results].sort((a, b) => {
    if (a.totalCostEur === null) return 1;
    if (b.totalCostEur === null) return -1;
    return a.totalCostEur - b.totalCostEur;
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isCreator && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/search?id=${searchId}`}>
                <Edit className="mr-1 h-4 w-4" /> Edit
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No results yet...</p>
        ) : (
          sortedResults.map((result, index) => (
            <ResultCard
              key={result.destinationId}
              cityName={result.cityName}
              cityCode={result.cityCode}
              totalCostEur={result.totalCostEur}
              overlap={result.overlap}
              travelers={result.travelers}
              rank={index + 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
