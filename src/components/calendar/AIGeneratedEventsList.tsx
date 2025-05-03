
import React from 'react';
import { Event } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash, Edit, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import EventGroupHeader from './event-list/EventGroupHeader';
import EventCard from './event-list/EventCard';

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
              <EventGroupHeader 
                groupKey={groupKey}
                eventCount={eventsInGroup.length}
              />
              
              {eventsInGroup.map((event, originalIndex) => {
                const index = events.findIndex(e => e === event); // Get the original index in the full events array
                
                return (
                  <EventCard
                    key={index}
                    event={event}
                    index={index}
                    onEditEvent={onEditEvent}
                    onDeleteEvent={onDeleteEvent}
                  />
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
