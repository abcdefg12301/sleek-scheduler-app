
import React from 'react';
import { Event } from '@/types';
import TimeGrid from './TimeGrid';

interface DailyCalendarGridProps {
  hours: number[];
  timedEvents: Event[];
  eventLayouts: {
    [id: string]: {
      top: number;
      height: number;
      left: number;
      width: number;
      overlappingEvents: number;
    };
  };
  onEventClick: (event: Event) => void;
}

const DailyCalendarGrid = ({ 
  hours, 
  timedEvents, 
  eventLayouts, 
  onEventClick 
}: DailyCalendarGridProps) => {
  return (
    <TimeGrid
      hours={hours}
      timedEvents={timedEvents}
      eventLayouts={eventLayouts}
      onEventClick={onEventClick}
    />
  );
};

export default DailyCalendarGrid;
