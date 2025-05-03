
import React from 'react';
import { Event } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash, Edit, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EventCardProps {
  event: Event;
  index: number;
  onEditEvent?: (event: Event, index: number) => void;
  onDeleteEvent: (index: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  index, 
  onEditEvent, 
  onDeleteEvent 
}) => {
  const formatEventDate = (event: Event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    // For recurring weekly events, just show day of week
    if (event.recurrence && event.recurrence.frequency === "weekly") {
      return `${format(start, 'EEEE')} ${format(start, 'p')} - ${format(end, 'p')}`;
    } 
    // For daily events
    else if (event.recurrence && event.recurrence.frequency === "daily") {
      return `${format(start, 'p')} - ${format(end, 'p')}`;
    }
    // For monthly/yearly events
    else if (event.recurrence) {
      return `${format(start, 'do')} ${format(start, 'p')} - ${format(end, 'p')}`;
    }
    // For one-time events, show the full date
    else {
      return `${format(start, 'PPP')} ${format(start, 'p')} - ${format(end, 'p')}`;
    }
  };

  const getEventTypeLabel = (event: Event) => {
    if (!event.recurrence) return "One-time";
    
    const { frequency, interval = 1 } = event.recurrence;
    
    switch (frequency) {
      case "daily":
        return interval === 1 ? "Daily" : `Every ${interval} days`;
      case "weekly":
        return interval === 1 ? "Weekly" : `Every ${interval} weeks`;
      case "monthly":
        return interval === 1 ? "Monthly" : `Every ${interval} months`;
      case "yearly":
        return interval === 1 ? "Yearly" : `Every ${interval} years`;
      default:
        return "Recurring";
    }
  };

  return (
    <Card className="p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{event.title}</h4>
          </div>
          
          <div className="text-sm text-muted-foreground mt-1 space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatEventDate(event)}</span>
            </div>
            
            {event.recurrence && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{getEventTypeLabel(event)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          {onEditEvent && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEditEvent(event, index);
              }}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteEvent(index);
            }}
            className="h-8 w-8"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
