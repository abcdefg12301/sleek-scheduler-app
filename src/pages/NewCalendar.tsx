import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarStore } from '@/store/calendar-store';
import CalendarBasicDetails from '@/components/calendar-form/CalendarBasicDetails';
import CalendarFeatures from '@/components/calendar-form/CalendarFeatures';
import { Event } from '@/types';
import { useAiCalendarEvents } from '@/hooks/useAiCalendarEvents';
import AIGeneratorSection from '@/components/calendar/AIGeneratorSection';
import { useStableAiEventState } from '@/hooks/useStableAiEventState';

interface FormData {
  name: string;
  description: string;
  color: string;
  showHolidays: boolean;
  sleepSchedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

const NewCalendar = () => {
  const navigate = useNavigate();
  const { addCalendar, addEvent } = useCalendarStore();

  // Robust AI event state: always reflects latest user changes and persists after calendar creation.
  const {
    events: aiEvents,
    setEvents: setAiEvents,
    deleteEvent: deleteAiEvent,
    clearEvents: clearAiEvents,
  } = useStableAiEventState({
    calendarId: undefined,
    initialEvents: [],
  });

  const defaultValues: FormData = {
    name: '',
    description: '',
    color: '#8B5CF6',
    showHolidays: true,
    sleepSchedule: {
      enabled: false,
      startTime: '22:00',
      endTime: '06:00'
    }
  };

  const form = useForm<FormData>({
    defaultValues,
  });

  const onSubmit = (data: FormData) => {
    try {
      const newCalendar = addCalendar(
        data.name,
        data.description,
        data.color,
        data.showHolidays
      );
      if (aiEvents.length > 0) {
        let addedCount = 0;
        for (const event of aiEvents) {
          try {
            const eventWithDates = {
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
              recurrence: event.recurrence ? {
                ...event.recurrence,
                endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined
              } : undefined,
              isAIGenerated: true,
              calendarId: newCalendar.id // <-- ensure calendarId is set
            };
            addEvent(newCalendar.id, eventWithDates);
            addedCount++;
          } catch (eventError) {
            console.error('Error adding AI-generated event:', eventError, event);
          }
        }
        if (addedCount > 0) {
          toast.success(`Added ${addedCount} AI-generated events to your calendar`);
        }
      }
      clearAiEvents();
      toast.success('Calendar created successfully');
      navigate(`/calendar/${newCalendar.id}`);
    } catch (error) {
      console.error('Failed to create calendar:', error);
      toast.error('Failed to create calendar');
    }
  };

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

  const timeOptions = generateTimeOptions();

  return (
    <div className="container max-w-xl pt-10 pb-20">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <h1 className="text-2xl font-bold mb-2">Create New Calendar</h1>
      <p className="text-muted-foreground mb-6">
        Set up a new calendar to organize your events.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-lg font-semibold mb-3">Calendar Details</h2>
          <CalendarBasicDetails form={form} />

          {/* Features section is now optional */}
          {/* <CalendarFeatures form={form} timeOptions={timeOptions} /> */}

          <h2 className="text-lg font-semibold mb-3">Quick Start with AI</h2>
          <AIGeneratorSection
            aiEvents={aiEvents}
            setAiEvents={setAiEvents}
            deleteAiEvent={deleteAiEvent}
            clearAllEvents={clearAiEvents}
            calendarId={undefined}
          />
          <div className="flex justify-end mt-6">
            <Button type="submit">Create Calendar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewCalendar;
