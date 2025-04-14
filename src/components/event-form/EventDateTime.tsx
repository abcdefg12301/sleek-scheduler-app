
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EventDateTimeProps {
  form: UseFormReturn<any>;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
}

const EventDateTime = ({ form, startDate, setStartDate, endDate, setEndDate }: EventDateTimeProps) => {
  const watchAllDay = form.watch('allDay');

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    setStartDate(date);
    form.setValue('start', date);
    
    // If end date is before new start date, adjust it
    if (endDate < date) {
      const newEndDate = new Date(date);
      if (!watchAllDay) {
        newEndDate.setHours(date.getHours() + 1, date.getMinutes(), 0, 0);
      }
      setEndDate(newEndDate);
      form.setValue('end', newEndDate);
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    setEndDate(date);
    form.setValue('end', date);
    
    // If start date is after new end date, adjust it
    if (startDate > date) {
      const newStartDate = new Date(date);
      if (!watchAllDay) {
        newStartDate.setHours(date.getHours() - 1, date.getMinutes(), 0, 0);
      }
      setStartDate(newStartDate);
      form.setValue('start', newStartDate);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Start Date */}
        <div className="space-y-2">
          <FormItem className="flex flex-col">
            <FormLabel>Start Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "pl-3 text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  disabled={(date) =>
                    date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormItem>
          
          {/* Start Time - Only show if not all day */}
          {!watchAllDay && (
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="time"
                          className="pl-8" 
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <FormItem className="flex flex-col">
            <FormLabel>End Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "pl-3 text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  disabled={(date) =>
                    date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormItem>
          
          {/* End Time - Only show if not all day */}
          {!watchAllDay && (
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="time"
                          className="pl-8" 
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDateTime;
