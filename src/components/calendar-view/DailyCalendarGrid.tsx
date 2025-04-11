
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { Event } from '@/types';
import { cn } from '@/lib/utils';

interface DailyCalendarGridProps {
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

const DailyCalendarGrid = ({ 
  hours, 
  timedEvents, 
  eventLayouts, 
  onEventClick 
}: DailyCalendarGridProps) => {
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
        
        // Generate classes for event display
        const eventClasses = cn(
          "absolute z-10 overflow-hidden",
          event.color ? `border-l-4` : "border-l-4 border-primary"
        );
        
        return (
          <div 
            key={event.id} 
            className={eventClasses}
            style={{ 
              top: `${layout.top}%`,
              left: `${layout.left}%`,
              width: `${layout.width}%`,
              height: `${Math.max(layout.height, 3)}%`, // Ensure minimum height for visibility
              borderLeftColor: event.color || undefined
            }}
            onClick={() => onEventClick(event)}
          >
            <div className={cn(
              "h-full p-1 overflow-hidden bg-card hover:shadow-md transition-shadow",
              layout.height < 5 ? "text-xs" : layout.height < 10 ? "text-sm" : "",
            )}>
              <div className="font-medium truncate">{event.title}</div>
              {layout.height > 5 && (
                <div className="text-xs text-muted-foreground">
                  {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DailyCalendarGrid;
