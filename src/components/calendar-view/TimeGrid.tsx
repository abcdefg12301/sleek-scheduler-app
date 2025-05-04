
import React from 'react';
import { Event as CalendarEvent } from '@/types';
import EventLayout from './EventLayout';
import { cn } from '@/lib/utils';

interface TimeGridProps {
  hours: number[];
  timedEvents: CalendarEvent[];
  eventLayouts: {
    [id: string]: {
      top: number;
      height: number;
      left: number;
      width: number;
      overlappingEvents: number;
    };
  };
  onEventClick: (event: CalendarEvent) => void;
}

const TimeGrid = ({ hours, timedEvents, eventLayouts, onEventClick }: TimeGridProps) => {
  // Group events by their overlapping time slots to better handle their layout
  const calculateOverlappingEvents = (events: CalendarEvent[]) => {
    const eventsByHour: { [hour: number]: CalendarEvent[] } = {};
    const enhancedLayouts = { ...eventLayouts };
    
    // Group events by starting hour
    events.forEach(event => {
      const startHour = new Date(event.start).getHours();
      if (!eventsByHour[startHour]) eventsByHour[startHour] = [];
      eventsByHour[startHour].push(event);
    });
    
    // Process each hour's events to check for overlaps
    Object.keys(eventsByHour).forEach(hourKey => {
      const hour = parseInt(hourKey);
      const hourEvents = eventsByHour[hour];
      
      // Skip if only one event in this hour
      if (hourEvents.length <= 1) return;
      
      // Sort by start time
      hourEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      
      // Find overlapping events
      for (let i = 0; i < hourEvents.length; i++) {
        const currentEvent = hourEvents[i];
        let overlappingCount = 0;
        let eventIndex = 0;
        
        // Count how many events overlap with the current one
        for (let j = 0; j < hourEvents.length; j++) {
          if (i === j) continue; // Skip comparing with itself
          
          const otherEvent = hourEvents[j];
          const currentStart = new Date(currentEvent.start).getTime();
          const currentEnd = new Date(currentEvent.end).getTime();
          const otherStart = new Date(otherEvent.start).getTime();
          const otherEnd = new Date(otherEvent.end).getTime();
          
          // Check for overlap
          if ((otherStart < currentEnd && otherStart >= currentStart) || 
              (otherEnd > currentStart && otherEnd <= currentEnd) ||
              (otherStart <= currentStart && otherEnd >= currentEnd)) {
            overlappingCount++;
            if (j < i) eventIndex++;
          }
        }
        
        // Update layout for better visualization
        if (overlappingCount > 0 && enhancedLayouts[currentEvent.id]) {
          const totalOverlapping = overlappingCount + 1; // Add 1 for the current event
          enhancedLayouts[currentEvent.id] = {
            ...enhancedLayouts[currentEvent.id],
            width: Math.floor(100 / totalOverlapping),
            left: Math.floor((100 / totalOverlapping) * eventIndex),
            overlappingEvents: totalOverlapping
          };
        }
      }
    });
    
    return enhancedLayouts;
  };
  
  // Calculate improved layouts to prevent event overlap
  const optimizedLayouts = calculateOverlappingEvents(timedEvents);
  
  return (
    <div className="relative">
      {/* Hour divisions */}
      {hours.map((hour) => (
        <div key={hour} className="h-16 border-b relative">
          {/* Half-hour line */}
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200"></div>
        </div>
      ))}
      
      {/* Events */}
      {timedEvents.map((event) => {
        const layout = optimizedLayouts[event.id];
        if (!layout) return null;
        return (
          <EventLayout 
            key={event.id}
            event={event}
            layout={layout}
            onEventClick={onEventClick}
          />
        );
      })}
      
      {/* Current time indicator */}
      <CurrentTimeIndicator />
    </div>
  );
};

// Current time indicator component
const CurrentTimeIndicator = () => {
  const [now, setNow] = React.useState(new Date());
  
  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  const hourHeight = 16 * 4; // 4rem or 16 * 4px
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const percentageOfHour = currentMinute / 60;
  const topPosition = (currentHour + percentageOfHour) * hourHeight;
  
  return (
    <div 
      className="absolute z-20 w-full pointer-events-none flex items-center"
      style={{ top: `${topPosition}px` }}
    >
      <div className="h-2 w-2 rounded-full bg-red-500 -ml-1"></div>
      <div className="h-[2px] flex-grow bg-red-500"></div>
    </div>
  );
};

export default TimeGrid;
