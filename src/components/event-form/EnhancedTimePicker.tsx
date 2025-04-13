
import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface EnhancedTimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

const EnhancedTimePicker = ({ value, onChange }: EnhancedTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const selectedTimeRef = useRef<HTMLButtonElement>(null);
  
  // Generate time options in 30-minute increments
  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      label: `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
    };
  });
  
  // Scroll to selected time on open
  useEffect(() => {
    if (isOpen && selectedTimeRef.current) {
      setTimeout(() => {
        selectedTimeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [isOpen]);
  
  // Handle time selection from dropdown
  const handleSelectTime = (time: string) => {
    onChange(time);
    setInputValue(time);
    setIsOpen(false);
  };
  
  // Validate and handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);
    
    // Validate as HH:MM format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(input)) {
      onChange(input);
    }
  };
  
  // Handle blur to format the input
  const handleBlur = () => {
    try {
      // Try to parse the input to a valid time
      const [hours, minutes] = inputValue.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        // Invalid time, reset to previous value
        setInputValue(value);
        return;
      }
      
      // Format as HH:MM
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setInputValue(formattedTime);
      onChange(formattedTime);
    } catch (e) {
      // Reset to previous valid value
      setInputValue(value);
    }
  };
  
  const formatDisplayTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours < 12 ? 'AM' : 'PM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Find the matching time option for display
  const displayValue = formatDisplayTime(value);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring focus-within:border-input">
          <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onClick={() => setIsOpen(true)}
            placeholder="HH:MM"
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <ScrollArea className="h-60 p-2">
          <div className="grid grid-cols-1 gap-1">
            {timeOptions.map((time) => (
              <Button
                key={time.value}
                type="button"
                variant="ghost"
                ref={time.value === value ? selectedTimeRef : null}
                className={cn(
                  "justify-start font-normal",
                  time.value === value && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSelectTime(time.value)}
              >
                {time.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedTimePicker;
