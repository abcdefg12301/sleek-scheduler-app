
import React from 'react';
import { Event as CalendarEvent } from '@/types';
import EventDisplay from '@/components/EventDisplay';

interface AllDayEventsProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const AllDayEvents = ({ events, onEventClick }: AllDayEventsProps) => {
  if (events.length === 0) return null;
  
  return (
    <div className="border-b py-2 mb-2">
      <div className="font-medium text-sm mb-1 pl-2">All-day events</div>
      <div className="flex flex-wrap gap-2 pl-2">
        {events.map(event => (
          <div key={event.id} className="max-w-xs">
            <EventDisplay event={event} onClick={() => onEventClick(event)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllDayEvents;
