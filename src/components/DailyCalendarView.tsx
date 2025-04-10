
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { Event } from '@/types';
import { cn } from '@/lib/utils';
import EventDisplay from './EventDisplay';

interface DailyCalendarViewProps {
  selectedDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

const DailyCalendarView = ({ selectedDate, events, onEventClick }: DailyCalendarViewProps) => {
  console.log('Rendering daily view for:', format(selectedDate, 'yyyy-MM-dd'));
  
  // Filter and sort events for the selected day
  const dailyEvents = events
    .filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return isSameDay(selectedDate, eventStart) || 
             isSameDay(selectedDate, eventEnd) ||
             (selectedDate >= eventStart && selectedDate <= eventEnd);
    })
    .sort((a, b) => {
      // Sort by start time
      const aStart = new Date(a.start).getTime();
      const bStart = new Date(b.start).getTime();
      
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return aStart - bStart;
    });
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  console.log(`Found ${dailyEvents.length} events for daily view`);

  return (
    <div className="w-full h-full">
      <div className="text-center py-4 border-b">
        <h2 className="text-xl font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>
      
      <div className="grid grid-cols-[60px_1fr] h-[calc(100vh-240px)] overflow-y-auto">
        <div className="border-r">
          {hours.map(hour => (
            <div key={hour} className="h-16 flex items-start justify-end pr-2 text-xs text-muted-foreground">
              {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
            </div>
          ))}
        </div>
        
        <div>
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b relative">
              {dailyEvents
                .filter(event => {
                  if (event.allDay) return hour === 0;
                  const eventHour = new Date(event.start).getHours();
                  return eventHour === hour;
                })
                .map((event, index) => (
                  <div 
                    key={event.id} 
                    className={cn(
                      "absolute left-0 right-1 z-10",
                      event.allDay ? "top-0" : ""
                    )}
                    style={{ 
                      top: event.allDay ? 0 : `${new Date(event.start).getMinutes() / 60 * 100}%`,
                    }}
                  >
                    <EventDisplay 
                      event={event} 
                      onClick={() => onEventClick(event)} 
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyCalendarView;
