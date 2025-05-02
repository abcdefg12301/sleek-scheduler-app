
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
import { Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIGeneratedEventsListProps {
  events: Event[];
  onDeleteEvent: (eventIndex: number) => void;
  onEditEvent?: (event: Event, index: number) => void; // New edit handler
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

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="generated-events">
      <AccordionItem value="generated-events">
        <AccordionTrigger className="font-medium">
          Generated Events ({events.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            {events.map((event, index) => (
              <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-secondary">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{event.title}</h4>
                    {formatRecurrence(event) && (
                      <Badge variant="outline" className="text-xs">
                        {formatRecurrence(event)}
                      </Badge>
                    )}
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-pencil"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
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
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AIGeneratedEventsList;
