import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plane, Users, MapPin, Euro } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 mb-4">
          <Plane className="h-10 w-10 text-blue-600" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Meet in the cheapest city
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Planning a group trip? Enter everyone&apos;s origin, pick candidate
          destinations, and meet-flight finds the cheapest place for everyone
          to gather.
        </p>

        <div>
          <Button asChild size="lg">
            <Link href="/search">
              <Plane className="mr-2 h-4 w-4" />
              Start searching
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100">
            <Users className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="font-semibold">Up to 6 travelers</h3>
          <p className="text-sm text-gray-500">
            Add each traveler&apos;s origin airport. Mark locals who don&apos;t
            need a flight.
          </p>
        </div>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100">
            <MapPin className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="font-semibold">Compare destinations</h3>
          <p className="text-sm text-gray-500">
            Pick up to 5 candidate destinations. We rank them by total cost.
          </p>
        </div>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100">
            <Euro className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="font-semibold">All in EUR</h3>
          <p className="text-sm text-gray-500">
            Prices converted to EUR with daily-updated rates for easy
            comparison.
          </p>
        </div>
      </div>
    </div>
  );
}
