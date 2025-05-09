
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
  
  const onSubmit = (data: FormData) => {
    if (id) {
      updateCalendar(id, {
        name: data.name,
        description: data.description,
        color: data.color,
        showHolidays: data.showHolidays
      });
      
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

  const handleAIGeneratedEvents = (events: Event[]) => {
    if (!id || !events.length) return;
    
    try {
      events.forEach(event => {
        // Prepare event data by omitting id and calendarId
        const { id: eventId, calendarId, ...eventData } = event;
        
        // Add the event to the calendar
        addEvent(id, eventData);
      });
      
      toast.success(`Added ${events.length} AI-generated events to your calendar`);
    } catch (error) {
      console.error('Failed to add AI-generated events:', error);
      toast.error('Failed to add some events');
    }
  };
  
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
          
          <div className="mt-10 mb-6">
            <h2 className="text-xl font-bold mb-4">Generate Events with AI</h2>
            <p className="text-muted-foreground mb-4">
              Let AI create events for your calendar based on your description.
            </p>
            <AICalendarGenerator 
              standalone={false} 
              onEventsGenerated={handleAIGeneratedEvents}
            />
          </div>
          
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
