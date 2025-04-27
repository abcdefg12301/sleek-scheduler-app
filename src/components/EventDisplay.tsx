
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Event as CalendarEvent } from '@/types';
import { Sparkles } from 'lucide-react';

interface EventDisplayProps {
  event: CalendarEvent;
  onClick?: () => void;
}

const EventDisplay = ({ event, onClick }: EventDisplayProps) => {
  const isAllDay = event.allDay;
  const isHoliday = event.isHoliday;
  const isAI = event.isAIGenerated;
  
  return (
    <div
      className={cn(
        "p-2 mb-2 rounded-md border-l-4 cursor-pointer hover:bg-accent/50 transition-colors",
        isHoliday ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "bg-card"
      )}
      style={{ 
        borderLeftColor: event.color || (isHoliday ? '#ef4444' : '#8B5CF6')
      }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium mb-1 text-sm">
          {event.title}
          {isAI && (
            <span className="inline-flex items-center ml-1 text-amber-500">
              <Sparkles size={12} className="inline" />
            </span>
          )}
        </h3>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {isAllDay ? (
          <span>All day</span>
        ) : (
          <span>
            {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
          </span>
        )}
        
        {event.location && (
          <div className="mt-1 truncate">{event.location}</div>
        )}
      </div>
    </div>
  );
};

export default EventDisplay;
