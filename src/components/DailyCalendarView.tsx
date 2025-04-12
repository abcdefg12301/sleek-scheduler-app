
import React, { useMemo } from 'react';
import { 
  format, isSameDay, 
  isWithinInterval, isBefore, isAfter, 
  startOfDay, endOfDay
} from 'date-fns';
import { Event } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import AllDayEvents from './calendar-view/AllDayEvents';
import HourLabels from './calendar-view/HourLabels';
import DailyCalendarGrid from './calendar-view/DailyCalendarGrid';
import { useDailyEventLayout } from '@/hooks/useDailyEventLayout';

interface DailyCalendarViewProps {
  selectedDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

const DailyCalendarView = ({ selectedDate, events, onEventClick }: DailyCalendarViewProps) => {
  // Get the events for the selected day
  const dailyEvents = useMemo(() => {
    // Filter events for the selected day including those that overlap with midnight
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      
      // Check if the event overlaps with the selected day
      return (
        // Event starts within the day
        isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
        // Event ends within the day
        isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
        // Event spans over the entire day
        (isBefore(eventStart, dayStart) && isAfter(eventEnd, dayEnd)) ||
        // Exact day matches
        isSameDay(eventStart, selectedDate) || 
        isSameDay(eventEnd, selectedDate)
      );
    }).sort((a, b) => {
      // Sort by all-day first, then by start time
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  }, [events, selectedDate]);
  
  // Group all-day events separately
  const allDayEvents = useMemo(() => {
    return dailyEvents.filter(event => event.allDay);
  }, [dailyEvents]);
  
  // Get timed events
  const timedEvents = useMemo(() => {
    return dailyEvents.filter(event => !event.allDay);
  }, [dailyEvents]);
  
  // Process the events by hour for visualization
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Calculate event layout data for positioning using our custom hook
  const eventLayouts = useDailyEventLayout(timedEvents, selectedDate);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center py-4 border-b">
        <h2 className="text-xl font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>
      
      {/* All-day events section */}
      <AllDayEvents events={allDayEvents} onEventClick={onEventClick} />
      
      {/* Time-based events section */}
      <div className="flex-grow h-[calc(100vh-240px)]">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-[60px_1fr] min-h-full">
            {/* Hour labels */}
            <HourLabels hours={hours} />
            
            {/* Event slots */}
            <DailyCalendarGrid
              hours={hours}
              timedEvents={timedEvents}
              eventLayouts={eventLayouts}
              onEventClick={onEventClick}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DailyCalendarView;
