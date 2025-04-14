
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EventDateTimeProps {
  form: UseFormReturn<any>;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
}

const EventDateTime = ({ form, startDate, setStartDate, endDate, setEndDate }: EventDateTimeProps) => {
  const isAllDay = form.watch('allDay');

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
                      format(field.value, "PPP")
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
                  selected={field.value}
                  onSelect={(date) => {
                    if (date) {
                      field.onChange(date);
                      setStartDate(date);

                      // Ensure end date isn't before start date
                      if (endDate < date) {
                        const newEndDate = new Date(date);
                        form.setValue("end", newEndDate);
                        setEndDate(newEndDate);
                      }
                    }
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
              <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring focus-within:border-input">
                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                <Input 
                  {...field}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="HH:MM"
                  type="time"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    // Update startDate with time
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newStartDate = new Date(startDate);
                    newStartDate.setHours(hours, minutes);
                    setStartDate(newStartDate);
                  }}
                />
              </div>
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
                      format(field.value, "PPP")
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
                  selected={field.value}
                  onSelect={(date) => {
                    if (date) {
                      field.onChange(date);
                      setEndDate(date);
                    }
                  }}
                  disabled={(date) => date < startDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
              <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring focus-within:border-input">
                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                <Input 
                  {...field}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="HH:MM"
                  type="time"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    // Update endDate with time
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newEndDate = new Date(endDate);
                    newEndDate.setHours(hours, minutes);
                    setEndDate(newEndDate);
                  }}
                />
              </div>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default EventDateTime;
