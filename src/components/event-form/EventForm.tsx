import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import EventBasicDetails from './EventBasicDetails';
import EventDateTime from './EventDateTime';
import EventLocation from './EventLocation';
import EventRecurrence from './EventRecurrence';

// Define the event form schema
import { eventFormSchema, EventFormValues } from './eventFormSchema';

interface EventFormProps {
  initialValues: Partial<Event>;
  onSubmit: (data: Omit<Event, 'id' | 'calendarId'>) => void;
  onCancel?: () => void;
}

const EventForm = ({ initialValues, onSubmit, onCancel }: EventFormProps) => {
  // Convert initialValues to form values
  const defaultValues: EventFormValues = {
    title: initialValues.title || '',
    description: initialValues.description || '',
    location: initialValues.location || '',
    allDay: initialValues.allDay || false,
    start: initialValues.start || new Date(),
    end: initialValues.end || new Date(Date.now() + 60 * 60 * 1000),
    startTime: initialValues.start 
      ? `${String(initialValues.start.getHours()).padStart(2, '0')}:${String(initialValues.start.getMinutes()).padStart(2, '0')}` 
      : '12:00',
    endTime: initialValues.end 
      ? `${String(initialValues.end.getHours()).padStart(2, '0')}:${String(initialValues.end.getMinutes()).padStart(2, '0')}`
      : '13:00',
    recurrenceEnabled: !!initialValues.recurrence,
    recurrenceFrequency: initialValues.recurrence?.frequency || 'daily',
    recurrenceInterval: initialValues.recurrence?.interval || 1,
    recurrenceEndDate: initialValues.recurrence?.endDate || undefined,
    recurrenceCount: initialValues.recurrence?.count || 1,
    color: initialValues.color || '',
  };

  // Initialize the form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  // Keep track of the start and end dates (for validation)
  const [startDate, setStartDate] = useState<Date>(defaultValues.start);
  const [endDate, setEndDate] = useState<Date>(defaultValues.end);
  
  // Get form values
  const isAllDay = form.watch('allDay');
  const isRecurring = form.watch('recurrenceEnabled');

  // When the form is submitted
  const handleSubmit = (values: EventFormValues) => {
    // Process dates based on allDay flag
    let startDate = new Date(values.start);
    let endDate = new Date(values.end);
    
    // If not all-day event, set the time components
    if (!values.allDay) {
      const [startHour, startMinute] = values.startTime.split(':').map(Number);
      const [endHour, endMinute] = values.endTime.split(':').map(Number);
      
      startDate.setHours(startHour, startMinute, 0, 0);
      endDate.setHours(endHour, endMinute, 0, 0);
    } else {
      // For all-day events, ensure time components are zeroed
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Build the event object to pass to the parent
    const newEvent: Omit<Event, 'id' | 'calendarId'> = {
      title: values.title,
      description: values.description || undefined,
      location: values.location || undefined,
      start: startDate,
      end: endDate,
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
      
      <EventDateTime 
        form={form} 
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      
      <EventLocation form={form} />
      
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
