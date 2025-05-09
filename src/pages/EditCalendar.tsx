
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarStore } from '@/store/calendar-store';
import { SleepSchedule, Event } from '@/types';
import CalendarBasicDetails from '@/components/calendar-form/CalendarBasicDetails';
import CalendarFeatures from '@/components/calendar-form/CalendarFeatures';
import AICalendarGenerator from '@/components/calendar/AICalendarGenerator';
import { useState } from 'react';

interface FormData {
  name: string;
  description: string;
  color: string;
  showHolidays: boolean;
  sleepSchedule: SleepSchedule;
}

const EditCalendar = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { calendars, updateCalendar, addEvent } = useCalendarStore();
  const [aiGeneratedEvents, setAiGeneratedEvents] = useState<Event[]>([]);
  
  const calendar = calendars.find(cal => cal.id === id);
  
  const form = useForm<FormData>({
    defaultValues: {
      name: calendar?.name || '',
      description: calendar?.description || '',
      color: calendar?.color || '#8B5CF6',
      showHolidays: calendar?.showHolidays !== undefined ? calendar.showHolidays : true,
      sleepSchedule: { enabled: false, startTime: '22:00', endTime: '06:00' }
    },
  });
  
  useEffect(() => {
    if (!calendar && id) {
      toast.error('Calendar not found');
      navigate('/');
    }
  }, [calendar, id, navigate]);
  
  const handleAiEventsGenerated = (events: Event[]) => {
    setAiGeneratedEvents(events);
  };
  
  const onSubmit = (data: FormData) => {
    if (id) {
      updateCalendar(id, {
        name: data.name,
        description: data.description,
        color: data.color,
        showHolidays: data.showHolidays
      });
      
      // Add all AI-generated events to this calendar
      if (aiGeneratedEvents.length > 0) {
        let addedCount = 0;
        
        for (const event of aiGeneratedEvents) {
          try {
            const eventWithDates = {
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
              recurrence: event.recurrence ? {
                ...event.recurrence,
                endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined
              } : undefined,
              isAIGenerated: true
            };

            addEvent(id, eventWithDates);
            addedCount++;
          } catch (eventError) {
            console.error('Error adding AI-generated event:', eventError, event);
          }
        }
        
        if (addedCount > 0) {
          toast.success(`Added ${addedCount} AI-generated events to your calendar`);
        }
      }
      
      toast.success('Calendar updated successfully');
      navigate(`/calendar/${id}`);
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
  
  if (!calendar) {
    return null;
  }

  return (
    <div className="container max-w-xl pt-10 pb-20">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/calendar/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Calendar
        </Button>
        <h1 className="text-2xl font-bold mb-2">Edit Calendar</h1>
        <p className="text-muted-foreground">
          Update your calendar settings.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CalendarBasicDetails form={form} />
          
          <h2 className="text-lg font-semibold mb-3">Quick Start with AI</h2>
          <AICalendarGenerator 
            standalone={true}
            onEventsGenerated={handleAiEventsGenerated}
          />
          
          <CalendarFeatures form={form} timeOptions={timeOptions} />

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditCalendar;
