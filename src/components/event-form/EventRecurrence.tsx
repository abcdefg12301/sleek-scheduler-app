
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './eventFormSchema';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, CalendarIcon as CalendarClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface EventRecurrenceProps {
  form: UseFormReturn<EventFormValues>;
  startDate: Date;
}

const EventRecurrence = ({ form, startDate }: EventRecurrenceProps) => {
  const isRecurring = form.watch('recurrenceEnabled');
  const recurrenceFrequency = form.watch('recurrenceFrequency');
  const recurrenceInterval = form.watch('recurrenceInterval');
  
  // Calculate example next dates based on recurrence settings
  const getNextDatesExample = () => {
    if (!isRecurring) return [];
    
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < 3; i++) {
      // Skip the first instance (start date)
      if (i === 0) {
        if (recurrenceFrequency === 'daily') {
          currentDate = addDays(currentDate, recurrenceInterval);
        } else if (recurrenceFrequency === 'weekly') {
          currentDate = addWeeks(currentDate, recurrenceInterval);
        } else if (recurrenceFrequency === 'monthly') {
          currentDate = addMonths(currentDate, recurrenceInterval);
        } else {
          currentDate = new Date(
            currentDate.getFullYear() + recurrenceInterval,
            currentDate.getMonth(),
            currentDate.getDate()
          );
        }
        dates.push(new Date(currentDate));
      } else {
        if (recurrenceFrequency === 'daily') {
          currentDate = addDays(currentDate, recurrenceInterval);
        } else if (recurrenceFrequency === 'weekly') {
          currentDate = addWeeks(currentDate, recurrenceInterval);
        } else if (recurrenceFrequency === 'monthly') {
          currentDate = addMonths(currentDate, recurrenceInterval);
        } else {
          currentDate = new Date(
            currentDate.getFullYear() + recurrenceInterval,
            currentDate.getMonth(),
            currentDate.getDate()
          );
        }
        dates.push(new Date(currentDate));
      }
    }
    
    return dates;
  };

  const nextDatesExample = getNextDatesExample();

  return (
    <>
      <FormField
        control={form.control}
        name="recurrenceEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Recurring Event</FormLabel>
              <FormDescription>
                Set up a recurring schedule for this event
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
      
      {isRecurring && (
        <div className="space-y-4 p-3 border rounded-lg">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="recurrenceFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recurrenceInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Every</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input 
                        type="number"
                        min="1"
                        max="365"
                        {...field} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          field.onChange(val > 0 ? val : 1);
                        }}
                        className="w-20" 
                      />
                      <span className="ml-2">
                        {recurrenceFrequency === 'daily' 
                          ? 'day(s)' 
                          : recurrenceFrequency === 'weekly'
                          ? 'week(s)'
                          : recurrenceFrequency === 'monthly'
                          ? 'month(s)'
                          : 'year(s)'}
                      </span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="recurrenceEndDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ends on (optional)</FormLabel>
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
                          <span>No end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  variant="ghost" 
                  type="button" 
                  className="mt-1 h-auto p-0 text-sm text-muted-foreground"
                  onClick={() => form.setValue("recurrenceEndDate", undefined)}
                >
                  Clear end date
                </Button>
              </FormItem>
            )}
          />
          
          {nextDatesExample.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Next occurrences:</p>
              <ul className="space-y-1">
                {nextDatesExample.map((date, index) => (
                  <li key={index} className="text-sm flex items-center">
                    <CalendarClockIcon className="h-3 w-3 mr-2 text-muted-foreground" />
                    {format(date, "EEEE, MMMM d, yyyy")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EventRecurrence;
