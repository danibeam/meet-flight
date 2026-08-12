import { SearchForm } from '@/components/search-form';
import { Plane } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-3">
          <Plane className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Find the cheapest meeting spot</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add travelers, pick destinations, set dates — we&apos;ll rank by total cost.
        </p>
      </div>

      <SearchForm />
    </div>
  );
}
