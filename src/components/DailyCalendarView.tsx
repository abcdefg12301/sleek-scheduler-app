
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Event } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import AllDayEvents from './calendar-view/AllDayEvents';
import DailyCalendarHeader from './calendar-view/DailyCalendarHeader';
import DailyCalendarGrid from './calendar-view/DailyCalendarGrid';
import { useDailyEventLayout } from '@/hooks/useDailyEventLayout';
import { filterEventsForDate } from '@/lib/event-utils';

interface DailyCalendarViewProps {
  selectedDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

const DailyCalendarView = ({ selectedDate, events, onEventClick }: DailyCalendarViewProps) => {
  // Get the events for the selected day using our utility function
  const dailyEvents = useMemo(() => 
    filterEventsForDate(events, selectedDate), [events, selectedDate]
  );
  
  // Group all-day events separately
  const allDayEvents = useMemo(() => 
    dailyEvents.filter(event => event.allDay), [dailyEvents]
  );
  
  // Get timed events
  const timedEvents = useMemo(() => 
    dailyEvents.filter(event => !event.allDay), [dailyEvents]
  );
  
  // Process the events by hour for visualization
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Calculate event layout data for positioning using our custom hook
  const eventLayouts = useDailyEventLayout(timedEvents, selectedDate);

  return (
    <div className="w-full h-full flex flex-col">
      <DailyCalendarHeader selectedDate={selectedDate} />
      
      {/* All-day events section */}
      <AllDayEvents events={allDayEvents} onEventClick={onEventClick} />
      
      {/* Time-based events section */}
      <div className="flex-grow h-[calc(100vh-240px)]">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-[60px_1fr] min-h-full">
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
