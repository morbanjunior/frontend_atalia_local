'use client';

import * as React from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedTime, setSelectedTime] = React.useState(value ?? new Date());

  const handleSelectTime = (hour: number, minute: number) => {
    const newDate = setMinutes(setHours(new Date(), hour), minute);
    setSelectedTime(newDate);
    onChange?.(newDate);
    setOpen(false);
  };

  const renderTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const date = setMinutes(setHours(new Date(), hour), min);
        options.push(
          <button
            key={`${hour}:${min}`}
            type="button"
            onClick={() => handleSelectTime(hour, min)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
          >
            {format(date, 'hh:mm a')}
          </button>
        );
      }
    }
    return options;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal w-full',
            !selectedTime && 'text-muted-foreground',
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {selectedTime ? format(selectedTime, 'hh:mm a') : <span>Seleccionar hora</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <div className="max-h-64 overflow-y-auto">{renderTimeOptions()}</div>
      </PopoverContent>
    </Popover>
  );
}
