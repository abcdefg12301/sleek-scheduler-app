
import React from 'react';
import { Event } from '@/types';
import EventLayout from './EventLayout';
import { cn } from '@/lib/utils';

interface TimeGridProps {
  hours: number[];
  timedEvents: Event[];
  eventLayouts: {
    [id: string]: {
      top: number;
      height: number;
      left: number;
      width: number;
      overlappingEvents: number;
    };
  };
  onEventClick: (event: Event) => void;
}

const TimeGrid = ({ hours, timedEvents, eventLayouts, onEventClick }: TimeGridProps) => {
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
        const layout = eventLayouts[event.id];
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
