
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Event } from '@/types';
import EventDisplay from '@/components/EventDisplay';

interface EventSidebarProps {
  selectedDate: Date;
  selectedDateEvents: Event[];
  handleNewEvent: () => void;
  handleEventClick: (event: Event) => void;
}

const EventSidebar = ({ 
  selectedDate, 
  selectedDateEvents, 
  handleNewEvent,
  handleEventClick 
}: EventSidebarProps) => {
  return (
    <div className="lg:w-1/4 bg-muted/20 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h2>
        <Button size="sm" variant="outline" onClick={handleNewEvent}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      
      {selectedDateEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No events for this day
        </div>
      ) : (
        <div>
          {selectedDateEvents.map((event) => (
            <EventDisplay
              key={event.id}
              event={event}
              onClick={() => handleEventClick(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventSidebar;
