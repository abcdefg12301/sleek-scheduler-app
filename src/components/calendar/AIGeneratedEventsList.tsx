
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
import { Trash, Edit, Clock, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  
  // Group events by recurrence type for better organization
  const groupedEvents = events.reduce((acc: Record<string, Event[]>, event) => {
    let group = 'one-time';
    
    if (event.recurrence) {
      group = event.recurrence.frequency || 'recurring';
    }
    
    if (!acc[group]) {
      acc[group] = [];
    }
    
    acc[group].push(event);
    return acc;
  }, {});

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

  // Order of event groups for display
  const groupDisplayOrder = ['daily', 'weekly', 'monthly', 'yearly', 'recurring', 'one-time'];

  return (
    <ScrollArea className="h-[400px] w-full pr-4">
      <div className="space-y-4 p-1">
        {groupDisplayOrder.map(groupKey => {
          const eventsInGroup = groupedEvents[groupKey];
          if (!eventsInGroup || eventsInGroup.length === 0) return null;
          
          return (
            <div key={groupKey} className="space-y-2">
              <h3 className="text-sm font-medium capitalize flex items-center mb-1">
                {groupKey === 'one-time' ? 'One-time events' : `${groupKey} events`}
                <Badge variant="outline" className="ml-2">
                  {eventsInGroup.length}
                </Badge>
              </h3>
              
              {eventsInGroup.map((event, originalIndex) => {
                const index = events.findIndex(e => e === event); // Get the original index in the full events array
                
                return (
                  <Card key={index} className="p-3 hover:shadow-sm transition-shadow">
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
              })}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default AIGeneratedEventsList;
