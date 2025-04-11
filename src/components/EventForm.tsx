
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { getTimeOptions, parseTimeOption } from '@/lib/date-utils';
import { Event, RecurrenceRule } from '@/types';
import RecurrenceOptions from './RecurrenceOptions';
import { ScrollArea } from '@/components/ui/scroll-area';
import EventFormFields from './EventFormFields';
import { isAfter, format as formatDate } from 'date-fns';

interface EventFormProps {
  initialValues?: Partial<Event>;
  onSubmit: (data: Omit<Event, 'id' | 'calendarId'>) => void;
  onCancel: () => void;
}

const EventForm = ({ initialValues, onSubmit, onCancel }: EventFormProps) => {
  console.log('Rendering EventForm with initialValues:', initialValues);
  
  // Use current time for new events
  const now = new Date();
  const defaultStart = initialValues?.start || now;
  const defaultEnd = initialValues?.end || new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
  
  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(defaultEnd);
  const [isAllDay, setIsAllDay] = useState<boolean>(initialValues?.allDay || false);
  const [timeOptions] = useState(getTimeOptions());
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(initialValues?.recurrence);
  
  // Format times for the form
  function formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  const defaultValues = {
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    allDay: initialValues?.allDay || false,
    color: initialValues?.color || '#8B5CF6',
    start: initialValues?.start || defaultStart,
    end: initialValues?.end || defaultEnd,
    startTime: initialValues?.start ? formatTime(new Date(initialValues.start)) : formatTime(defaultStart),
    endTime: initialValues?.end ? formatTime(new Date(initialValues.end)) : formatTime(defaultEnd),
  };
  
  const form = useForm({ defaultValues });
  
  // Update end time when start time changes to ensure end is always after start
  useEffect(() => {
    if (!isAllDay) {
      const startDateTime = parseTimeOption(form.getValues('startTime'), startDate);
      const endDateTime = parseTimeOption(form.getValues('endTime'), endDate);
      
      if (!isAfter(endDateTime, startDateTime)) {
        // Set end time to 1 hour after start time
        const newEnd = new Date(startDateTime);
        newEnd.setHours(newEnd.getHours() + 1);
        form.setValue('endTime', formatTime(newEnd));
      }
    }
  }, [form.getValues('startTime'), startDate, isAllDay]);
  
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      console.log('Start date changed to:', date);
      setStartDate(date);
      
      // Adjust end date if it's now before start date
      if (endDate < date) {
        console.log('End date is before start date, adjusting to:', date);
        setEndDate(date);
        form.setValue('end', date);
      }
    }
  };
  
  const handleAllDayToggle = (checked: boolean) => {
    console.log('All day toggled to:', checked);
    setIsAllDay(checked);
  };
  
  const validateTimeRange = (formData: any) => {
    const startDateTime = parseTimeOption(formData.startTime, formData.start);
    const endDateTime = parseTimeOption(formData.endTime, formData.end);
    
    console.log('Validating time range:', startDateTime, endDateTime);
    
    if (isAfter(startDateTime, endDateTime)) {
      console.error('Start time is after end time');
      form.setError('endTime', { 
        type: 'manual', 
        message: 'End time must be after start time' 
      });
      return false;
    }
    
    return true;
  };
  
  const handleFormSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
    
    // Validate time range when not an all-day event
    if (!data.allDay && !validateTimeRange(data)) {
      return;
    }
    
    // Create start and end dates with combined date and time
    const processedData = { ...data };
    
    if (data.allDay) {
      // For all-day events, set times to start/end of day
      const startDay = new Date(startDate);
      startDay.setHours(0, 0, 0, 0);
      
      const endDay = new Date(endDate);
      endDay.setHours(23, 59, 59, 999);
      
      processedData.start = startDay;
      processedData.end = endDay;
    } else {
      // Combine date and time for non-all-day events
      processedData.start = parseTimeOption(data.startTime, startDate);
      processedData.end = parseTimeOption(data.endTime, endDate);
      
      // Final validation check
      if (processedData.start > processedData.end) {
        form.setError('endTime', { 
          type: 'manual', 
          message: 'End time must be after start time' 
        });
        return;
      }
    }
    
    // Remove the separate time fields before submitting
    delete processedData.startTime;
    delete processedData.endTime;
    
    // Add recurrence information
    if (recurrence) {
      processedData.recurrence = recurrence;
    }
    
    onSubmit(processedData);
  };
  
  return (
    <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="allDay"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">All day</FormLabel>
                  <FormDescription>
                    Event will last the entire day
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleAllDayToggle(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <EventFormFields 
            form={form}
            isAllDay={isAllDay}
            startDate={startDate}
            endDate={endDate}
            timeOptions={timeOptions}
            handleStartDateChange={handleStartDateChange}
            setEndDate={setEndDate}
          />
          
          <div className="border p-4 rounded-md">
            <FormLabel className="mb-2 block">Repeat</FormLabel>
            <RecurrenceOptions 
              value={recurrence} 
              onChange={setRecurrence} 
              startDate={startDate} 
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialValues?.id ? "Update" : "Create"} Event
            </Button>
          </div>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default EventForm;
