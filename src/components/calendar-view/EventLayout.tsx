
import React from 'react';
import { format } from 'date-fns';
import { Event as CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';

interface EventLayoutProps {
  event: CalendarEvent;
  layout: {
    top: number;
    height: number;
    left: number;
    width: number;
    overlappingEvents: number;
  };
  onEventClick: (event: CalendarEvent) => void;
}

const EventLayout = ({ event, layout, onEventClick }: EventLayoutProps) => {
  // Generate classes for event display
  const eventClasses = cn(
    "absolute z-10 overflow-hidden",
    "border-l-4",
    event.isSegment && event.segmentType === 'middle' && "border-l-0 border-r-0 rounded-none",
    event.isSegment && event.segmentType === 'start' && "rounded-b-none",
    event.isSegment && event.segmentType === 'end' && "rounded-t-none"
  );
  
  return (
    <div 
      className={eventClasses}
      style={{ 
        top: `${layout.top}%`,
        left: `${layout.left}%`,
        width: `${layout.width}%`,
        height: `${Math.max(layout.height, 3)}%`, // Ensure minimum height for visibility
        borderLeftColor: event.color || '#8B5CF6'
      }}
      onClick={() => onEventClick(event)}
    >
      <div className={cn(
        "h-full p-1 overflow-hidden bg-card hover:shadow-md transition-shadow rounded-r",
        layout.height < 5 ? "text-xs" : layout.height < 10 ? "text-sm" : "",
        event.start.getHours() >= 20 || event.start.getHours() < 6 ? "bg-card/90" : "", // Darker background for night events
        event.isSegment && event.segmentType === 'middle' && "rounded-none",
        event.isSegment && event.segmentType === 'start' && "rounded-b-none",
        event.isSegment && event.segmentType === 'end' && "rounded-t-none"
      )}>
        <div className="font-medium truncate">
          {event.title}
        </div>
        {layout.height > 5 && (
          <div className="text-xs text-muted-foreground">
            {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventLayout;
