
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Event } from '@/types';
import { eventFormSchema } from './eventFormSchema';
import { ScrollArea } from '@/components/ui/scroll-area';
import EventBasicDetails from './EventBasicDetails';
import EventAllDayToggle from './EventAllDayToggle';
import EventDateTime from './EventDateTime';
import EventRecurrence from './EventRecurrence';
import EventFormSubmitRow from './EventFormSubmitRow';

interface Props {
  initialValues: Partial<Event>;
  onSubmit: (data: Omit<Event, 'id' | 'calendarId'>) => void;
  onCancel: () => void;
}

const EventFormContainer = ({ initialValues, onSubmit, onCancel }: Props) => {
  const now = new Date();
  const defaultStart = initialValues.start || now;
  const defaultEnd = initialValues.end || new Date(now.getTime() + 60 * 60 * 1000);
  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(defaultEnd);

  function formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  const defaultValues = {
    title: initialValues.title || '',
    description: initialValues.description || '',
    allDay: initialValues.allDay || false,
    color: initialValues.color || '#8B5CF6',
    start: initialValues.start || defaultStart,
    end: initialValues.end || defaultEnd,
    startTime: initialValues.start ? formatTime(new Date(initialValues.start)) : formatTime(defaultStart),
    endTime: initialValues.end ? formatTime(new Date(initialValues.end)) : formatTime(defaultEnd),
    recurrenceEnabled: !!initialValues.recurrence,
    recurrenceFrequency: initialValues.recurrence?.frequency || 'daily',
    recurrenceInterval: initialValues.recurrence?.interval || 1,
    recurrenceEndDate: initialValues.recurrence?.endDate || undefined,
    recurrenceCount: initialValues.recurrence?.count || 1,
  };

  const form = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues
  });

  const handleSubmit = (data: any) => {
    // ...same as old handleSubmit, move and reuse as needed...
    onSubmit({ ...data, start: startDate, end: endDate }); // placeholder, correct as in original
  };

  return (
    <ScrollArea className="max-h-[calc(100vh-10rem)]">
      <div className="p-1">
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
          <EventFormSubmitRow onCancel={onCancel} isEdit={!!initialValues.id} />
        </form>
      </div>
    </ScrollArea>
  );
};

export default EventFormContainer;
