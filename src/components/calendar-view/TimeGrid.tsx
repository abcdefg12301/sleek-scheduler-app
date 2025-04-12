
import React from 'react';
import { Event } from '@/types';
import EventLayout from './EventLayout';

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
    </div>
  );
};

export default TimeGrid;
