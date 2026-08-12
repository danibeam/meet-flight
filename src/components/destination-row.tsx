'use client';

import { AirportAutocomplete } from './airport-autocomplete';
import { Button } from '@/components/ui/button';
import { Trash2, MapPin } from 'lucide-react';

export interface DestinationData {
  cityCode: string;
  cityName: string;
}

interface DestinationRowProps {
  index: number;
  data: DestinationData;
  onChange: (data: DestinationData) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function DestinationRow({ index, data, onChange, onRemove, canRemove }: DestinationRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
        <MapPin className="h-4 w-4 text-gray-600" />
      </div>

      <div className="flex-1">
        <AirportAutocomplete
          value={data.cityCode ? `${data.cityName} (${data.cityCode})` : ''}
          onChange={(code, label) => onChange({ cityCode: code, cityName: label.split(' (')[0] ?? code })}
          placeholder={`Destination ${index + 1}...`}
          preferCity
        />
      </div>

      {canRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-gray-400" />
        </Button>
      )}
    </div>
  );
}
