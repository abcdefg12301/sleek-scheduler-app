
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Info } from 'lucide-react';
import { Event as CalendarEvent } from '@/types';
import EventDisplay from '@/components/EventDisplay';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { filterDuplicateSleepEvents } from '@/lib/event-utils';

interface EventSidebarProps {
  selectedDate: Date;
  selectedDateEvents: CalendarEvent[];
  handleNewEvent: () => void;
  handleEventClick: (event: CalendarEvent) => void;
}

const EventSidebar = ({ 
  selectedDate, 
  selectedDateEvents, 
  handleNewEvent,
  handleEventClick 
}: EventSidebarProps) => {
  // Deduplicate sleep events using our utility function
  const filteredEvents = React.useMemo(() =>
    filterDuplicateSleepEvents(selectedDateEvents),
    [selectedDateEvents]
  );

  return (
    <div className="lg:w-1/4 bg-muted/20 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-medium">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This sidebar shows all events for the selected day.<br />
                Click on any event to view, edit or delete it.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button size="sm" variant="outline" onClick={handleNewEvent}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No events for this day</p>
          <p className="text-xs mt-1">Click 'Add' to create a new event</p>
        </div>
      ) : (
        <div>
          {filteredEvents.map((event) => (
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
