
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

interface AIGeneratedEventsListProps {
  events: Event[];
  onDeleteEvent: (eventIndex: number) => void;
}

const AIGeneratedEventsList = ({ events, onDeleteEvent }: AIGeneratedEventsListProps) => {
  if (!events.length) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="generated-events">
        <AccordionTrigger>
          Generated Events ({events.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                <div className="flex-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start), 'PPp')} - {format(new Date(event.end), 'PPp')}
                  </p>
                  {event.description && (
                    <p className="text-sm mt-1">{event.description}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDeleteEvent(index)}
                  className="ml-2"
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
