
import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface DateTimeFieldsProps {
  form: UseFormReturn<any>;
  isAllDay: boolean;
  startDate: Date;
  endDate: Date;
  timeOptions: { label: string; value: string }[];
  handleStartDateChange: (date: Date | undefined) => void;
  setEndDate: (date: Date) => void;
}

const DateTimeFields: React.FC<DateTimeFieldsProps> = ({
  form,
  isAllDay,
  startDate,
  endDate,
  timeOptions,
  handleStartDateChange,
  setEndDate,
}) => {
  // Function to parse time string (HH:MM) and set it to a date
  const handleTimeInputChange = (timeStr: string, dateField: Date, setter: (date: Date) => void) => {
    if (!timeStr) return;
    
    // Match format like "13:45" or "9:30"
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      
      // Validate hours and minutes
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const newDate = new Date(dateField);
        newDate.setHours(hours, minutes, 0, 0);
        setter(newDate);
        return newDate;
      }
    }
    
    // If invalid format, return the original date
    return dateField;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="start"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Start date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(field.value)}
                  onSelect={(date) => {
                    if (date) {
                      field.onChange(date);
                      handleStartDateChange(date);
                    }
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {!isAllDay && (
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start time</FormLabel>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-3 flex-shrink-0"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="h-[300px] overflow-auto p-2">
                      {timeOptions.map((option) => (
                        <div
                          key={option.value}
                          className="cursor-pointer p-2 hover:bg-muted rounded-md"
                          onClick={() => {
                            field.onChange(option.value);
                            const [hours, minutes] = option.value.split(':');
                            const newDate = new Date(startDate);
                            newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                            handleStartDateChange(newDate);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <FormControl>
                  <Input
                    placeholder="HH:MM"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleTimeInputChange(e.target.value, startDate, (date) => {
                        handleStartDateChange(date);
                      });
                    }}
                    className="flex-grow"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="end"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>End date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(field.value)}
                  onSelect={(date) => {
                    if (date && date < startDate) {
                      return;
                    }
                    field.onChange(date);
                    if (date) {
                      setEndDate(date);
                    }
                  }}
                  disabled={(date) => date < startDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {!isAllDay && (
        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End time</FormLabel>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-3 flex-shrink-0"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="h-[300px] overflow-auto p-2">
                      {timeOptions.map((option) => (
                        <div
                          key={option.value}
                          className="cursor-pointer p-2 hover:bg-muted rounded-md"
                          onClick={() => {
                            field.onChange(option.value);
                            const [hours, minutes] = option.value.split(':');
                            const newDate = new Date(endDate);
                            newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                            setEndDate(newDate);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <FormControl>
                  <Input
                    placeholder="HH:MM"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleTimeInputChange(e.target.value, endDate, setEndDate);
                    }}
                    className="flex-grow"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default DateTimeFields;
