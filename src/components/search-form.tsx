'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TravelerRow, type TravelerData } from './traveler-row';
import { DestinationRow, type DestinationData } from './destination-row';
import { DateRangePicker, type SettingsData } from './date-range-picker';
import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MAX_TRAVELERS = 6;
const MAX_DESTINATIONS = 5;

export function SearchForm() {
  const router = useRouter();

  const [travelers, setTravelers] = useState<TravelerData[]>([
    { name: '', originCode: '', isLocal: false },
  ]);
  const [destinations, setDestinations] = useState<DestinationData[]>([
    { cityCode: '', cityName: '' },
  ]);
  const [settings, setSettings] = useState<SettingsData>({
    dateRangeStart: '',
    dateRangeEnd: '',
    durationMin: 2,
    durationMax: 4,
    nonStop: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch =
    travelers.some((t) => t.name.trim() && (t.isLocal || t.originCode)) &&
    destinations.some((d) => d.cityCode) &&
    settings.dateRangeStart &&
    settings.dateRangeEnd;

  function addTraveler() {
    if (travelers.length >= MAX_TRAVELERS) return;
    setTravelers([...travelers, { name: '', originCode: '', isLocal: false }]);
  }

  function removeTraveler(index: number) {
    setTravelers(travelers.filter((_, i) => i !== index));
  }

  function addDestination() {
    if (destinations.length >= MAX_DESTINATIONS) return;
    setDestinations([...destinations, { cityCode: '', cityName: '' }]);
  }

  function removeDestination(index: number) {
    setDestinations(destinations.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validTravelers = travelers.filter(
      (t) => t.name.trim() && (t.isLocal || t.originCode)
    );
    const validDestinations = destinations.filter((d) => d.cityCode);

    if (validTravelers.length === 0) {
      setError('At least 1 traveler with a name is required');
      return;
    }
    if (validDestinations.length === 0) {
      setError('At least 1 destination is required');
      return;
    }
    if (!settings.dateRangeStart || !settings.dateRangeEnd) {
      setError('Date range is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRangeStart: settings.dateRangeStart,
          dateRangeEnd: settings.dateRangeEnd,
          durationMin: settings.durationMin,
          durationMax: settings.durationMax,
          nonStop: settings.nonStop,
          travelers: validTravelers,
          destinations: validDestinations,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Search failed');
      }

      const { id } = await res.json();

      const stored = JSON.parse(localStorage.getItem('created_searches') ?? '[]');
      stored.push(id);
      localStorage.setItem('created_searches', JSON.stringify(stored));

      router.push(`/results/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">
            Travelers ({travelers.length}/{MAX_TRAVELERS})
          </Label>
          {travelers.length < MAX_TRAVELERS && (
            <Button type="button" variant="outline" size="sm" onClick={addTraveler}>
              <Plus className="mr-1 h-4 w-4" /> Add traveler
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {travelers.map((traveler, i) => (
            <TravelerRow
              key={i}
              index={i}
              data={traveler}
              onChange={(data) => {
                const next = [...travelers];
                next[i] = data;
                setTravelers(next);
              }}
              onRemove={() => removeTraveler(i)}
              canRemove={travelers.length > 1}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">
            Destinations ({destinations.length}/{MAX_DESTINATIONS})
          </Label>
          {destinations.length < MAX_DESTINATIONS && (
            <Button type="button" variant="outline" size="sm" onClick={addDestination}>
              <Plus className="mr-1 h-4 w-4" /> Add destination
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {destinations.map((dest, i) => (
            <DestinationRow
              key={i}
              index={i}
              data={dest}
              onChange={(data) => {
                const next = [...destinations];
                next[i] = data;
                setDestinations(next);
              }}
              onRemove={() => removeDestination(i)}
              canRemove={destinations.length > 1}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <Label className="text-base">Travel Settings</Label>
        <DateRangePicker data={settings} onChange={setSettings} />
      </section>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!canSearch || isSubmitting}
      >
        {isSubmitting ? (
          <>Searching...</>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Search flights
          </>
        )}
      </Button>
    </form>
  );
}
