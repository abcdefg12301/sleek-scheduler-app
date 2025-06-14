import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarStore } from '@/store/calendar-store';
import CalendarBasicDetails from '@/components/calendar-form/CalendarBasicDetails';
import { Event } from '@/types';
import { useStableAiEventState } from '@/hooks/useStableAiEventState';
import AIGeneratorSection from '@/components/calendar/AIGeneratorSection';

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

  // AI event state, ONLY for this new calendar. They are not added anywhere until save.
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

  const colorValue = form.watch('color');

  // When saving new calendar, add AI events to new calendar only. Then clear preview state.
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
                endDate: event.recurrence.endDate
                  ? new Date(event.recurrence.endDate)
                  : undefined
              } : undefined,
              isAIGenerated: true,
              calendarId: newCalendar.id,
              color: data.color
            };
            addEvent(newCalendar.id, eventWithDates);
            addedCount++;
          } catch (eventError) {
            console.error('Error adding AI-generated event:', eventError, event);
          }
        }
        if (addedCount > 0) toast.success(`Added ${addedCount} AI-generated events to your calendar`);
      }
      clearAiEvents();
      toast.success('Calendar created successfully');
      navigate(`/calendar/${newCalendar.id}`);
    } catch (error) {
      console.error('Failed to create calendar:', error);
      toast.error('Failed to create calendar');
    }
  };

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
          <h2 className="text-lg font-semibold mb-3">Quick Start with AI</h2>
          <AIGeneratorSection
            aiEvents={aiEvents}
            setAiEvents={setAiEvents}
            deleteAiEvent={deleteAiEvent}
            clearAllEvents={clearAiEvents}
            calendarId={undefined}
            calendarColor={colorValue}
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
// no features block, no extra code, all AI events only in local state until saved
