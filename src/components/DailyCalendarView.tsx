
import React from 'react';
import { format, isSameDay, differenceInMinutes } from 'date-fns';
import { Event } from '@/types';
import { cn } from '@/lib/utils';
import EventDisplay from './EventDisplay';
import DayPreviewBar from './calendar/DayPreviewBar';

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
      const currentDay = new Date(selectedDate);
      
      // Reset time for date comparison
      const startDate = new Date(eventStart);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(eventEnd);
      endDate.setHours(0, 0, 0, 0);
      
      currentDay.setHours(0, 0, 0, 0);
      
      // Check if the event overlaps with the selected day
      return (startDate <= currentDay && endDate >= currentDay) || 
             isSameDay(selectedDate, eventStart) || 
             isSameDay(selectedDate, eventEnd);
    })
    .sort((a, b) => {
      // Sort by start time
      const aStart = new Date(a.start).getTime();
      const bStart = new Date(b.start).getTime();
      
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return aStart - bStart;
    });
  
  console.log(`Found ${dailyEvents.length} events for daily view`);
  
  // Group events by hour to handle overlapping events
  const eventsByHour: { [hour: number]: Event[] } = {};
  dailyEvents.forEach(event => {
    if (event.allDay) {
      // Put all-day events in a special bucket
      eventsByHour[-1] = eventsByHour[-1] || [];
      eventsByHour[-1].push(event);
    } else {
      const startHour = new Date(event.start).getHours();
      eventsByHour[startHour] = eventsByHour[startHour] || [];
      eventsByHour[startHour].push(event);
    }
  });
  
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="w-full h-full">
      <div className="text-center py-4 border-b">
        <h2 className="text-xl font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>
      
      {/* All-day events section */}
      {eventsByHour[-1] && eventsByHour[-1].length > 0 && (
        <div className="border-b py-2 mb-2">
          <div className="font-medium text-sm mb-1 pl-2">All-day events</div>
          <div className="flex flex-wrap gap-2 pl-2">
            {eventsByHour[-1].map(event => (
              <div key={event.id} className="max-w-xs">
                <EventDisplay event={event} onClick={() => onEventClick(event)} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-[60px_1fr] h-[calc(100vh-240px)] overflow-y-auto">
        <div className="border-r">
          {hours.map(hour => (
            <div key={hour} className="h-16 flex items-start justify-end pr-2 text-xs text-muted-foreground">
              {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
            </div>
          ))}
        </div>
        
        <div>
          {hours.map(hour => {
            const hourEvents = eventsByHour[hour] || [];
            const eventsCount = hourEvents.length;
            
            return (
              <div key={hour} className="h-16 border-b relative">
                {hourEvents.map((event, index) => {
                  const eventStart = new Date(event.start);
                  const eventEnd = new Date(event.end);
                  
                  // Calculate event duration in minutes for this day and hour
                  const startOfDay = new Date(selectedDate);
                  startOfDay.setHours(0, 0, 0, 0);
                  
                  const endOfDay = new Date(selectedDate);
                  endOfDay.setHours(23, 59, 59, 999);
                  
                  // Adjust event times if they span multiple days
                  const adjustedStart = eventStart < startOfDay ? startOfDay : eventStart;
                  const adjustedEnd = eventEnd > endOfDay ? endOfDay : eventEnd;
                  
                  // Calculate height percentage based on duration
                  const eventMinutes = Math.min(
                    differenceInMinutes(adjustedEnd, adjustedStart),
                    24 * 60 // Cap at a full day
                  );
                  
                  const minutesInDay = 24 * 60;
                  const heightPercentage = (eventMinutes / minutesInDay) * 100;
                  
                  // Calculate position based on start time
                  const startMinuteOfDay = eventStart.getHours() * 60 + eventStart.getMinutes();
                  const topPercentage = (startMinuteOfDay / minutesInDay) * 100;
                  
                  // Calculate width for overlapping events
                  const width = 100 / (eventsCount > 1 ? eventsCount : 1);
                  const leftOffset = width * index;
                  
                  return (
                    <div 
                      key={event.id} 
                      className="absolute z-10"
                      style={{ 
                        top: `${eventStart.getMinutes() / 60 * 100}%`,
                        left: `${leftOffset}%`,
                        width: `${width}%`,
                        height: `${heightPercentage}%`,
                        maxHeight: '400%', // Allow events to span multiple hours
                      }}
                    >
                      <div className="pr-1 h-full">
                        <EventDisplay 
                          event={event} 
                          onClick={() => onEventClick(event)} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyCalendarView;
