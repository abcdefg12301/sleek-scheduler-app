
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SleepSchedule } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bed } from 'lucide-react';

interface SleepScheduleFormProps {
  initialValues: SleepSchedule;
  onSubmit: (data: SleepSchedule) => void;
  onCancel: () => void;
}

function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = min.toString().padStart(2, '0');
      options.push({ value: `${h}:${m}`, label: formatTimeDisplay(`${h}:${m}`) });
    }
  }
  return options;
}

function formatTimeDisplay(time: string) {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 || 12;
  return `${hour}:${minutes} ${period}`;
}

const SleepScheduleForm = ({ initialValues, onSubmit, onCancel }: SleepScheduleFormProps) => {
  const [timeOptions] = useState(generateTimeOptions);
  
  const form = useForm<SleepSchedule>({
    defaultValues: {
      enabled: initialValues?.enabled || false,
      startTime: initialValues?.startTime || '22:00',
      endTime: initialValues?.endTime || '06:00'
    }
  });

  useEffect(() => {
    // Initialize form with provided values
    form.reset({
      enabled: initialValues?.enabled || false,
      startTime: initialValues?.startTime || '22:00',
      endTime: initialValues?.endTime || '06:00' 
    });
  }, [initialValues, form]);
  
  const handleSubmit = (data: SleepSchedule) => {
    onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <Bed className="mr-2 h-5 w-5" /> 
                  Sleep Schedule
                </FormLabel>
                <FormDescription>
                  Track your sleep times in the calendar
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
        
        {form.watch('enabled') && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wake Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Sleep Schedule
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SleepScheduleForm;
