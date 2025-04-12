
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
import { Button } from '@/components/ui/button';
import { Bed, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  
  // Function to validate and format time input
  const handleTimeChange = (value: string, field: any) => {
    // If it's already in HH:MM format, use it directly
    if (/^\d{2}:\d{2}$/.test(value)) {
      field.onChange(value);
      return;
    }
    
    // Try to parse and format the input
    const match = value.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (match) {
      let hours = parseInt(match[1], 10);
      let minutes = match[2] ? parseInt(match[2], 10) : 0;
      
      // Validate hours and minutes
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        field.onChange(formattedTime);
      }
    }
  };
  
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
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 px-3 flex-shrink-0"
                          type="button" // Important to prevent form submission
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="h-[300px] overflow-auto p-2">
                          {timeOptions.map((option) => (
                            <div
                              key={option.value}
                              className="cursor-pointer p-2 hover:bg-muted rounded-md"
                              onClick={() => field.onChange(option.value)}
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
                        onChange={(e) => handleTimeChange(e.target.value, field)}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wake Time</FormLabel>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 px-3 flex-shrink-0"
                          type="button" // Important to prevent form submission
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="h-[300px] overflow-auto p-2">
                          {timeOptions.map((option) => (
                            <div
                              key={option.value}
                              className="cursor-pointer p-2 hover:bg-muted rounded-md"
                              onClick={() => field.onChange(option.value)}
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
                        onChange={(e) => handleTimeChange(e.target.value, field)}
                      />
                    </FormControl>
                  </div>
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
