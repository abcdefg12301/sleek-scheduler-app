
import React from 'react';
import { Event } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatEventTime } from '@/lib/date-utils';
import { Clock, MapPin } from 'lucide-react';

interface EventDisplayProps {
  event: Event;
  onClick: () => void;
}

const EventDisplay = ({ event, onClick }: EventDisplayProps) => {
  return (
    <Card 
      className="mb-2 cursor-pointer hover:shadow-md transition-shadow" 
      style={{ 
        borderLeft: `4px solid ${event.color || '#8B5CF6'}` 
      }}
      onClick={onClick}
    >
      <CardContent className="py-3 px-4">
        <h4 className="font-medium mb-1">{event.title}</h4>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock size={14} className="mr-1" />
          {event.allDay ? (
            <span>All day</span>
          ) : (
            <span>
              {formatEventTime(event.start)} - {formatEventTime(event.end)}
            </span>
          )}
        </div>
        
        {event.location && (
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin size={14} className="mr-1" />
            <span>{event.location}</span>
          </div>
        )}
        
        {event.description && (
          <p className="text-sm mt-2 line-clamp-2">{event.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EventDisplay;
