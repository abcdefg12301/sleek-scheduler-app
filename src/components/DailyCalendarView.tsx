
import React, { useMemo } from 'react';
import { format, isSameDay, differenceInMinutes, addMinutes, isWithinInterval, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { Event } from '@/types';
import { cn } from '@/lib/utils';
import EventDisplay from './EventDisplay';
import DayPreviewBar from './calendar/DayPreviewBar';
import { ScrollArea } from './ui/scroll-area';

interface DailyCalendarViewProps {
  selectedDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

const DailyCalendarView = ({ selectedDate, events, onEventClick }: DailyCalendarViewProps) => {
  // Get the events for the selected day
  const dailyEvents = useMemo(() => {
    // Filter events for the selected day including those that overlap with midnight
    return events
      .filter(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const dayStart = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);
        
        // Check if the event overlaps with the selected day
        return isWithinInterval(dayStart, { start: eventStart, end: eventEnd }) || 
               isWithinInterval(dayEnd, { start: eventStart, end: eventEnd }) ||
               (isBefore(eventStart, dayStart) && isAfter(eventEnd, dayEnd)) ||
               isSameDay(selectedDate, eventStart) || 
               isSameDay(selectedDate, eventEnd);
      })
      .sort((a, b) => {
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

  // Calculate event layout data for positioning
  const eventLayouts = useMemo(() => {
    // Group events by time slots to handle overlapping
    const slots: {[key: string]: Event[]} = {};
    
    timedEvents.forEach(event => {
      const eventStart = new Date(event.start);
      const eventStartHour = eventStart.getHours();
      
      // Use the hour as a key
      const key = eventStartHour.toString();
      if (!slots[key]) slots[key] = [];
      slots[key].push(event);
    });
    
    // Calculate layout for each event
    const layouts: {[id: string]: {
      top: number, 
      height: number, 
      left: number, 
      width: number,
      overlappingEvents: number
    }} = {};
    
    // Process each time slot
    Object.keys(slots).forEach(hourKey => {
      const eventsInSlot = slots[hourKey];
      
      // Find overlapping events in this time slot
      if (eventsInSlot.length > 0) {
        // Sort by start time
        eventsInSlot.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        
        // Create groups of overlapping events
        const overlappingGroups: Event[][] = [];
        let currentGroup: Event[] = [eventsInSlot[0]];
        
        for (let i = 1; i < eventsInSlot.length; i++) {
          const currentEvent = eventsInSlot[i];
          const previousEvent = eventsInSlot[i-1];
          
          const currentStart = new Date(currentEvent.start);
          const previousEnd = new Date(previousEvent.end);
          
          // Check if events overlap
          if (currentStart < previousEnd) {
            currentGroup.push(currentEvent);
          } else {
            overlappingGroups.push([...currentGroup]);
            currentGroup = [currentEvent];
          }
        }
        
        overlappingGroups.push(currentGroup);
        
        // Process each group to calculate layout
        overlappingGroups.forEach(group => {
          const groupSize = group.length;
          
          group.forEach((event, index) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            
            // Calculate day-relative positions (for events crossing midnight)
            const dayStart = startOfDay(selectedDate);
            const dayEnd = endOfDay(selectedDate);
            
            // Adjust event times to day boundaries if needed
            const adjustedStart = isBefore(eventStart, dayStart) ? dayStart : eventStart;
            const adjustedEnd = isAfter(eventEnd, dayEnd) ? dayEnd : eventEnd;
            
            // Calculate top position based on minutes from start of day
            const startMinutes = (adjustedStart.getHours() * 60) + adjustedStart.getMinutes();
            const top = (startMinutes / (24 * 60)) * 100;
            
            // Calculate height based on event duration within this day
            const durationMinutes = differenceInMinutes(adjustedEnd, adjustedStart);
            const height = (durationMinutes / (24 * 60)) * 100;
            
            // Calculate width and left offset for overlapping events
            const width = 100 / groupSize;
            const left = width * index;
            
            // Store layout data
            layouts[event.id] = { top, height, left, width, overlappingEvents: groupSize };
          });
        });
      }
    });
    
    return layouts;
  }, [timedEvents, selectedDate]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center py-4 border-b">
        <h2 className="text-xl font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>
      
      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="border-b py-2 mb-2">
          <div className="font-medium text-sm mb-1 pl-2">All-day events</div>
          <div className="flex flex-wrap gap-2 pl-2">
            {allDayEvents.map(event => (
              <div key={event.id} className="max-w-xs">
                <EventDisplay event={event} onClick={() => onEventClick(event)} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Time-based events section */}
      <div className="flex-grow h-[calc(100vh-240px)]">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-[60px_1fr] min-h-full">
            {/* Hour labels */}
            <div className="border-r">
              {hours.map(hour => (
                <div key={hour} className="h-16 flex items-start justify-end pr-2 text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                </div>
              ))}
            </div>
            
            {/* Event slots */}
            <div className="relative">
              {/* Hour divisions */}
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b relative">
                  {/* Optional: Add half-hour line */}
                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200"></div>
                </div>
              ))}
              
              {/* Events */}
              {timedEvents.map(event => {
                const layout = eventLayouts[event.id];
                
                if (!layout) return null;
                
                return (
                  <div 
                    key={event.id} 
                    className="absolute z-10" 
                    style={{ 
                      top: `${layout.top}%`,
                      left: `${layout.left}%`,
                      width: `${layout.width}%`,
                      height: `${layout.height}%`,
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
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DailyCalendarView;
