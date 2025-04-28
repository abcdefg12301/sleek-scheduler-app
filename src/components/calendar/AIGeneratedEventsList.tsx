
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
}

const AIGeneratedEventsList = ({ events, onDeleteEvent }: AIGeneratedEventsListProps) => {
  if (!events.length) return null;

  const formatRecurrence = (event: Event) => {
    if (!event.recurrence) return "One-time event";
    
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
        return "Recurring event";
    }
  };

  const formatEventDate = (event: Event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    if (event.recurrence) {
      // For recurring events, show day of week
      return `${format(start, 'EEEE')} ${format(start, 'p')} - ${format(end, 'p')}`;
    } else {
      // For one-time events, show the full date
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
                    {event.recurrence && (
                      <Badge variant="outline" className="text-xs">
                        {formatRecurrence(event)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatEventDate(event)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDeleteEvent(index)}
                  className="ml-2 mt-1"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AIGeneratedEventsList;
