import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Event } from '@/types';
import EventAllDayToggle from './event-form/EventAllDayToggle';
import EventBasicDetails from './event-form/EventBasicDetails';
import EventDateTime from './event-form/EventDateTime';
import EventRecurrence from './event-form/EventRecurrence';
import { parseTimeToDate } from '@/lib/date-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema } from './event-form/eventFormSchema';
import { addDays, isBefore } from 'date-fns';

interface EventFormProps {
  initialValues?: Partial<Event>;
  onSubmit: (data: Omit<Event, 'id' | 'calendarId'>) => void;
  onCancel: () => void;
}

const EventForm = ({ initialValues, onSubmit, onCancel }: EventFormProps) => {
  // Use current time for new events
  const now = new Date();
  const defaultStart = initialValues?.start || now;
  const defaultEnd = initialValues?.end || new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
  
  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(defaultEnd);
  
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
    recurrenceEnabled: !!initialValues?.recurrence,
    recurrenceFrequency: initialValues?.recurrence?.frequency || 'daily',
    recurrenceInterval: initialValues?.recurrence?.interval || 1,
    recurrenceEndDate: initialValues?.recurrence?.endDate || undefined,
    recurrenceCount: initialValues?.recurrence?.count || 1,
  };
  
  const form = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues
  });
  const isAllDay = form.watch('allDay');

  const handleSubmit = (data: any) => {
    // Process dates based on allDay flag
    let processedStartDate = new Date(startDate);
    let processedEndDate = new Date(endDate);
    
    if (!data.allDay) {
      // Combine date and time for regular events
      processedStartDate = parseTimeToDate(data.startTime, startDate);
      processedEndDate = parseTimeToDate(data.endTime, endDate);
      
      // Handle cross-day events: if end time is before start time, assume it's next day
      if (processedEndDate <= processedStartDate) {
        // If the times suggest a cross-day event, move end to next day
        const startTime = data.startTime.split(':').map(Number);
        const endTime = data.endTime.split(':').map(Number);
        
        // If end time is significantly earlier than start time, it's likely cross-day
        if (endTime[0] < startTime[0] || (endTime[0] === startTime[0] && endTime[1] < startTime[1])) {
          processedEndDate = addDays(processedEndDate, 1);
        } else {
          // Otherwise, just add an hour as fallback
          processedEndDate = new Date(processedStartDate.getTime() + 60 * 60 * 1000);
        }
      }
    } else {
      // For all-day events, set to start/end of day
      processedStartDate.setHours(0, 0, 0, 0);
      processedEndDate.setHours(23, 59, 59, 999);
    }
    
    // Build the final event
    const newEvent: Omit<Event, 'id' | 'calendarId'> = {
      title: data.title,
      description: data.description || undefined,
      start: processedStartDate,
      end: processedEndDate,
      allDay: data.allDay,
      color: data.color || undefined,
      recurrence: data.recurrenceEnabled ? {
        frequency: data.recurrenceFrequency,
        interval: data.recurrenceInterval,
        endDate: data.recurrenceEndDate,
        count: data.recurrenceCount,
      } : undefined,
    };
    
    onSubmit(newEvent);
  };
  
  return (
    <ScrollArea className="max-h-[calc(100vh-10rem)]">
      <div className="p-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <EventBasicDetails form={form} />
            
            <EventAllDayToggle form={form} />
            
            <EventDateTime
              form={form} 
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
            
            <EventRecurrence form={form} startDate={startDate} />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {initialValues?.id ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
};

export default EventForm;
