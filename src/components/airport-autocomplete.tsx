'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AirportResult {
  code: string;
  name: string;
  cityName: string | null;
  country: string | null;
  type: string;
}

interface AirportAutocompleteProps {
  value: string;
  onChange: (code: string, label: string) => void;
  placeholder?: string;
  disabled?: boolean;
  preferCity?: boolean;
}

export function AirportAutocomplete({
  value,
  onChange,
  placeholder = 'Search airport or city...',
  disabled,
  preferCity,
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AirportResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function search(q: string) {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/airports?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        let filtered = data as AirportResult[];
        if (preferCity) {
          filtered = [...filtered].sort((a, b) => {
            if (a.type === 'CITY' && b.type !== 'CITY') return -1;
            if (b.type === 'CITY' && a.type !== 'CITY') return 1;
            return 0;
          });
        }
        setResults(filtered);
        setIsOpen(true);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  }

  function selectResult(result: AirportResult) {
    const label = result.cityName
      ? `${result.cityName} (${result.code})`
      : `${result.name} (${result.code})`;
    setQuery(label);
    onChange(result.code, label);
    setIsOpen(false);
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
          )}
          {results.map((result) => (
            <button
              key={result.code}
              type="button"
              onClick={() => selectResult(result)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100',
                'cursor-pointer border-b border-gray-100 last:border-0'
              )}
            >
              <div>
                <span className="font-medium">{result.code}</span>
                <span className="ml-2 text-gray-600">
                  {result.cityName ?? result.name}
                </span>
              </div>
              {result.type === 'CITY' && (
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                  City
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
