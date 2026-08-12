'use client';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AirportAutocomplete } from './airport-autocomplete';
import { Button } from '@/components/ui/button';
import { Trash2, User } from 'lucide-react';

export interface TravelerData {
  name: string;
  originCode: string;
  isLocal: boolean;
}

interface TravelerRowProps {
  index: number;
  data: TravelerData;
  onChange: (data: TravelerData) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function TravelerRow({ index, data, onChange, onRemove, canRemove }: TravelerRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
      <div className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <User className="h-4 w-4" />
      </div>

      <div className="flex-1 space-y-3">
        <Input
          placeholder={`Traveler ${index + 1} name`}
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
        />

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <AirportAutocomplete
              value={data.originCode}
              onChange={(code) => onChange({ ...data, originCode: code })}
              placeholder="Origin airport..."
              disabled={data.isLocal}
            />
          </div>

          <label className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
            <Checkbox
              checked={data.isLocal}
              onChange={(e) =>
                onChange({ ...data, isLocal: e.target.checked, originCode: e.target.checked ? '' : data.originCode })
              }
            />
            Local
          </label>
        </div>
      </div>

      {canRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove} className="mt-1">
          <Trash2 className="h-4 w-4 text-gray-400" />
        </Button>
      )}
    </div>
  );
}
