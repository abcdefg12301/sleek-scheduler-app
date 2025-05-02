
import React from 'react';
import { Event } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AIGeneratedEventsListProps {
  events: Event[];
  onDeleteEvent: (eventIndex: number) => void;
  onEditEvent?: (event: Event, index: number) => void;
}

const AIGeneratedEventsList = ({ 
  events, 
  onDeleteEvent,
  onEditEvent
}: AIGeneratedEventsListProps) => {
  if (!events.length) return null;

  const formatRecurrence = (event: Event) => {
    if (!event.recurrence) return null;
    
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
        return null;
    }
  };

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
    return formatRecurrence(event) || "Recurring";
  };

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="generated-events">
      <AccordionItem value="generated-events">
        <AccordionTrigger className="font-medium">
          Generated Events ({events.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {events.map((event, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getEventTypeLabel(event)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatEventDate(event)}
                    </p>
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
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AIGeneratedEventsList;
