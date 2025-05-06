
import React from 'react';
import { Event as CalendarEvent } from '@/types';
import TimeGrid from './TimeGrid';
import HourLabels from './HourLabels';

interface DailyCalendarGridProps {
  hours: number[];
  timedEvents: CalendarEvent[];
  eventLayouts: {
    [id: string]: {
      top: number;
      height: number;
      left: number;
      width: number;
      overlappingEvents: number;
    };
  };
  onEventClick: (event: CalendarEvent) => void;
}

const DailyCalendarGrid = ({ 
  hours, 
  timedEvents, 
  eventLayouts, 
  onEventClick 
}: DailyCalendarGridProps) => {
  return (
    <div className="max-w-screen-lg mx-auto">
      {/* Hour labels */}
      <HourLabels hours={hours} />
      
      {/* Event slots */}
      <TimeGrid
        hours={hours}
        timedEvents={timedEvents}
        eventLayouts={eventLayouts}
        onEventClick={onEventClick}
      />
    </div>
  );
};

export default DailyCalendarGrid;
