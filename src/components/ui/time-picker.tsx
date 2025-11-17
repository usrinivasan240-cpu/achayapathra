'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${String(hour).padStart(2, '0')}:${String(
        minute
      ).padStart(2, '0')}`;
      options.push(time);
    }
  }
  return options;
}

const timeOptions = generateTimeOptions();

export function TimePicker({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: (date: Date) => void;
}) {
  const selectedTime = React.useMemo(() => {
    if (!date) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // Find the closest 15-minute interval
    const roundedMinutes = String(Math.floor(parseInt(minutes) / 15) * 15).padStart(2, '0');
    return `${hours}:${roundedMinutes}`;
  }, [date]);

  const handleTimeChange = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = date ? new Date(date) : new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0, 0);
    setDate(newDate);
  };

  return (
    <Select value={selectedTime} onValueChange={handleTimeChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a time" />
      </SelectTrigger>
      <SelectContent>
        {timeOptions.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
