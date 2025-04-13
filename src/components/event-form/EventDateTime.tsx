
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './eventFormSchema';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import {
  FormControl,
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import EnhancedTimePicker from './EnhancedTimePicker';

interface EventDateTimeProps {
  form: UseFormReturn<EventFormValues>;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
}

const EventDateTime = ({ form, startDate, setStartDate, endDate, setEndDate }: EventDateTimeProps) => {
  const isAllDay = form.watch('allDay');

  return (
    <>
      <FormField
        control={form.control}
        name="allDay"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-base">All day event</FormLabel>
              <FormDescription>
                Set as an all-day event with no specific time
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

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
                <PopoverContent className="w-auto p-0" align="start">
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
                <EnhancedTimePicker
                  value={field.value}
                  onChange={(time) => {
                    field.onChange(time);
                    // Update startDate with time
                    const [hours, minutes] = time.split(':').map(Number);
                    const newStartDate = new Date(startDate);
                    newStartDate.setHours(hours, minutes);
                    setStartDate(newStartDate);
                  }}
                />
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
                <PopoverContent className="w-auto p-0" align="start">
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
                <EnhancedTimePicker
                  value={field.value}
                  onChange={(time) => {
                    field.onChange(time);
                    // Update endDate with time
                    const [hours, minutes] = time.split(':').map(Number);
                    const newEndDate = new Date(endDate);
                    newEndDate.setHours(hours, minutes);
                    setEndDate(newEndDate);
                  }}
                />
              </FormItem>
            )}
          />
        )}
      </div>
    </>
  );
};

export default EventDateTime;
