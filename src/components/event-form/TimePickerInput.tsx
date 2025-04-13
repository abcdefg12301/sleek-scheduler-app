import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  onTimeSelected: (value: string) => void;
}

const TimePickerInput: React.FC<TimePickerInputProps> = ({
  value,
  onChange,
  onTimeSelected,
}) => {
  // Generate time options in 15-minute increments
  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const value = `${formattedHour}:${formattedMinute}`;
        
        // Format for display (12-hour format)
        const displayHour = hour % 12 || 12;
        const period = hour < 12 ? 'AM' : 'PM';
        const label = `${displayHour}:${formattedMinute} ${period}`;
        
        options.push({ value, label });
      }
    }
    return options;
  }, []);

  // Function to validate and format time input
  const handleInputChange = (inputValue: string) => {
    // If it's already in HH:MM format, use it directly
    if (/^\d{2}:\d{2}$/.test(inputValue)) {
      onChange(inputValue);
      return;
    }
    
    // Try to parse other formats
    let match;
    
    // Try to match "3:30" or "3:30pm" format
    match = inputValue.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3]?.toLowerCase();
      
      if (period === 'pm' && hours < 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }
      
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        onChange(formattedTime);
      }
      return;
    }
    
    // Try to match "3pm" format (assume :00 minutes)
    match = inputValue.match(/^(\d{1,2})\s*(am|pm)$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const period = match[2].toLowerCase();
      
      if (period === 'pm' && hours < 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }
      
      if (hours >= 0 && hours < 24) {
        const formattedTime = `${hours.toString().padStart(2, '0')}:00`;
        onChange(formattedTime);
      }
      return;
    }
    
    // Basic HH:MM format with validation
    match = inputValue.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (match) {
      let hours = parseInt(match[1], 10);
      let minutes = match[2] ? parseInt(match[2], 10) : 0;
      
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        onChange(formattedTime);
      }
    }
  };

  // Format the display time (convert from 24h to 12h format)
  const formatDisplayTime = (timeValue: string) => {
    if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) {
      return timeValue;
    }
    
    const [hours, minutes] = timeValue.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Display 12-hour format in the input, but keep 24-hour format in the form state
  const displayValue = React.useMemo(() => formatDisplayTime(value), [value]);

  return (
    <div className="flex items-center gap-2">
      <Popover>
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
          <ScrollArea className="h-72 w-48 rounded-md">
            <div className="grid p-2">
              {timeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className={cn(
                    "flex justify-start font-normal",
                    value === option.value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    onTimeSelected(option.value);
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      <Input
        value={displayValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Enter time (e.g. 3:30 PM)"
        className="flex-grow"
      />
    </div>
  );
};

export default TimePickerInput;
