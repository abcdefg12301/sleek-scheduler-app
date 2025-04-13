
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
import TimePickerInput from './TimePickerInput';

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
              <TimePickerInput
                value={field.value}
                onChange={field.onChange}
                onTimeSelected={(time) => {
                  field.onChange(time);
                  // Update the startDate with the selected time
                  const [hours, minutes] = time.split(':').map(Number);
                  const newDate = new Date(startDate);
                  newDate.setHours(hours, minutes, 0, 0);
                  handleStartDateChange(newDate);
                }}
              />
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
              <TimePickerInput
                value={field.value}
                onChange={field.onChange}
                onTimeSelected={(time) => {
                  field.onChange(time);
                  // Update the endDate with the selected time
                  const [hours, minutes] = time.split(':').map(Number);
                  const newDate = new Date(endDate);
                  newDate.setHours(hours, minutes, 0, 0);
                  setEndDate(newDate);
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default DateTimeFields;
