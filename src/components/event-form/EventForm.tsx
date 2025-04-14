
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema } from './eventFormSchema';
import EventBasicDetails from './EventBasicDetails';
import EventAllDayToggle from './EventAllDayToggle';
import EventDateTime from './EventDateTime';
import EventRecurrence from './EventRecurrence';

interface EventFormProps {
  initialValues: Partial<Event>;
  onSubmit: (data: Omit<Event, 'id' | 'calendarId'>) => void;
  onCancel: () => void;
}

const EventForm = ({ initialValues, onSubmit, onCancel }: EventFormProps) => {
  // Convert initialValues to form values
  const now = new Date();
  const defaultStartDate = initialValues.start || now;
  const defaultEndDate = initialValues.end || new Date(now.getTime() + 60 * 60 * 1000);
  
  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(defaultEndDate);
  
  // Format times for the form
  function formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  const defaultValues = {
    title: initialValues.title || '',
    description: initialValues.description || '',
    allDay: initialValues.allDay || false,
    color: initialValues.color || '#8B5CF6',
    start: initialValues.start || now,
    end: initialValues.end || new Date(now.getTime() + 60 * 60 * 1000),
    startTime: initialValues.start ? formatTime(new Date(initialValues.start)) : '09:00',
    endTime: initialValues.end ? formatTime(new Date(initialValues.end)) : '10:00',
    recurrenceEnabled: !!initialValues.recurrence,
    recurrenceFrequency: initialValues.recurrence?.frequency || 'daily',
    recurrenceInterval: initialValues.recurrence?.interval || 1,
    recurrenceEndDate: initialValues.recurrence?.endDate,
    recurrenceCount: initialValues.recurrence?.count || 5
  };
  
  const form = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues
  });
  
  const handleSubmit = (values: any) => {
    // Process dates based on allDay flag
    let processedStart = new Date(startDate);
    let processedEnd = new Date(endDate);
    
    if (!values.allDay) {
      // Combine date and time
      const [startHour, startMinute] = values.startTime.split(':').map(Number);
      const [endHour, endMinute] = values.endTime.split(':').map(Number);
      
      processedStart.setHours(startHour, startMinute, 0, 0);
      processedEnd.setHours(endHour, endMinute, 0, 0);
    } else {
      // For all-day events, set times to start/end of day
      processedStart.setHours(0, 0, 0, 0);
      processedEnd.setHours(23, 59, 59, 999);
    }
    
    // Build the final event
    const newEvent: Omit<Event, 'id' | 'calendarId'> = {
      title: values.title,
      description: values.description || undefined,
      start: processedStart,
      end: processedEnd,
      allDay: values.allDay,
      color: values.color || undefined,
      recurrence: values.recurrenceEnabled ? {
        frequency: values.recurrenceFrequency,
        interval: values.recurrenceInterval,
        endDate: values.recurrenceEndDate,
        count: values.recurrenceCount,
      } : undefined,
    };
    
    onSubmit(newEvent);
  };
  
  return (
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
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {initialValues.id ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
