'use client';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface SettingsData {
  dateRangeStart: string;
  dateRangeEnd: string;
  durationMin: number;
  durationMax: number;
  nonStop: boolean;
}

interface DateRangePickerProps {
  data: SettingsData;
  onChange: (data: SettingsData) => void;
}

export function DateRangePicker({ data, onChange }: DateRangePickerProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Departure from</Label>
          <Input
            type="date"
            value={data.dateRangeStart}
            onChange={(e) => onChange({ ...data, dateRangeStart: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Departure until</Label>
          <Input
            type="date"
            value={data.dateRangeEnd}
            onChange={(e) => onChange({ ...data, dateRangeEnd: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Min days</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={data.durationMin}
            onChange={(e) => onChange({ ...data, durationMin: parseInt(e.target.value) || 2 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Max days</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={data.durationMax}
            onChange={(e) => onChange({ ...data, durationMax: parseInt(e.target.value) || 4 })}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <Checkbox
          checked={data.nonStop}
          onChange={(e) => onChange({ ...data, nonStop: e.target.checked })}
        />
        Direct flights only
      </label>
    </div>
  );
}
