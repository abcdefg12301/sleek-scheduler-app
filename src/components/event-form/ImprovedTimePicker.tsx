import React, { useState, useRef, useEffect } from 'react';
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

interface ImprovedTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  onTimeSelected: (time: string) => void;
  label?: string;
}

const ImprovedTimePicker: React.FC<ImprovedTimePickerProps> = ({
  value,
  onChange,
  onTimeSelected,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTimeRef = useRef<HTMLButtonElement>(null);
  
  // Format the display time (24h to 12h)
  const formatDisplayTime = (timeString: string): string => {
    if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) return timeString;
    
    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Generate time options in 15-minute increments
  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const value = `${formattedHour}:${formattedMinute}`;
        
        const displayHour = hour % 12 || 12;
        const period = hour < 12 ? 'AM' : 'PM';
        const label = `${displayHour}:${formattedMinute} ${period}`;
        
        options.push({ value, label });
      }
    }
    return options;
  }, []);
  
  // Scroll to the selected time when the popover opens
  useEffect(() => {
    if (isOpen && selectedTimeRef.current) {
      setTimeout(() => {
        selectedTimeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 150);
    }
  }, [isOpen]);
  
  // Validate and parse time input
  const handleTimeInput = (input: string) => {
    // Keep the original input for display
    const originalInput = input;
    
    // Handle empty case
    if (!input.trim()) {
      return;
    }
    
    let hours = 0;
    let minutes = 0;
    let valid = false;
    
    // Try different formats
    
    // Format: "3:30 PM" or "3:30PM"
    const timeWithColonAndPeriod = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i;
    let match = input.match(timeWithColonAndPeriod);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const period = match[3]?.toLowerCase();
      
      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      valid = hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
    }
    
    // Format: "3pm" (no minutes)
    if (!valid) {
      const timeWithPeriod = /^(\d{1,2})\s*(am|pm)$/i;
      match = input.match(timeWithPeriod);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = 0;
        const period = match[2].toLowerCase();
        
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        valid = hours >= 0 && hours < 24;
      }
    }
    
    // Format: "1530" (24-hour, no colon)
    if (!valid) {
      const militaryTime = /^(\d{3,4})$/;
      match = input.match(militaryTime);
      if (match) {
        const timeStr = match[1].padStart(4, '0');
        hours = parseInt(timeStr.substring(0, 2), 10);
        minutes = parseInt(timeStr.substring(2), 10);
        
        valid = hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
      }
    }
    
    // Format: "15:30" or "3:30" (no period, assume 24h)
    if (!valid) {
      const timeWithColon = /^(\d{1,2}):(\d{2})$/;
      match = input.match(timeWithColon);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        
        valid = hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
      }
    }
    
    // If we have a valid time, update the value
    if (valid) {
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      onChange(formattedTime);
      onTimeSelected(formattedTime);
    }
  };
  
  const displayValue = formatDisplayTime(value);
  
  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 flex-shrink-0"
            type="button"
          >
            <Clock className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <ScrollArea className="h-[300px] w-[120px]">
            <div className="p-2">
              {timeOptions.map((option) => (
                <Button
                  key={option.value}
                  ref={option.value === value ? selectedTimeRef : null}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-normal",
                    option.value === value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    onTimeSelected(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      <div className="relative w-full">
        {label && <span className="text-xs text-muted-foreground absolute -top-5 left-0">{label}</span>}
        <Input
          value={displayValue}
          onChange={(e) => handleTimeInput(e.target.value)}
          onBlur={(e) => handleTimeInput(e.target.value)}
          placeholder="Enter time (e.g. 3:30 PM)"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ImprovedTimePicker;
