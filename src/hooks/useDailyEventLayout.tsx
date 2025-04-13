
import { useMemo } from 'react';
import { Event } from '@/types';
import { isSameDay, differenceInMinutes, addDays } from 'date-fns';

// Custom hook to calculate event layouts for the daily calendar view
export function useDailyEventLayout(events: Event[], selectedDate: Date) {
  return useMemo(() => {
    // Calculate positions and sizes for all events
    const layouts: {
      [id: string]: {
        top: number;
        height: number;
        left: number;
        width: number;
        overlappingEvents: number;
      }
    } = {};
    
    if (!events.length) return layouts;
    
    // Track overlapping events
    const eventsByPosition: {[position: string]: Event[]} = {};
    
    events.forEach(event => {
      // Skip all-day events
      if (event.allDay) return;
      
      // Get start and end times relative to the day
      const startDate = new Date(event.start);
      let endDate = new Date(event.end);
      
      // Handle events that go past midnight
      if (!isSameDay(startDate, endDate)) {
        if (isSameDay(selectedDate, startDate)) {
          // For events starting on this day, end at midnight
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59);
        } else if (isSameDay(selectedDate, endDate)) {
          // For events ending on this day, start at midnight
          endDate = new Date(endDate);
          startDate.setHours(0, 0, 0);
        } else {
          // For events completely spanning this day, use full day
          startDate.setHours(0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59);
        }
      }
      
      // Calculate time percentages
      const minutesInDay = 24 * 60;
      const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
      const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
      
      // Convert to percentages
      const top = (startMinutes / minutesInDay) * 100;
      const height = ((endMinutes - startMinutes) / minutesInDay) * 100;
      
      // Store initial layout with full width
      layouts[event.id] = {
        top,
        height: Math.max(height, 1), // Ensure minimum height
        left: 0,
        width: 100,
        overlappingEvents: 0
      };
      
      // Track position for overlap detection
      const position = `${top.toFixed(1)}`;
      if (!eventsByPosition[position]) {
        eventsByPosition[position] = [];
      }
      eventsByPosition[position].push(event);
    });
    
    // Handle overlapping events - very simplified version
    Object.values(eventsByPosition).forEach(positionEvents => {
      if (positionEvents.length > 1) {
        // There are overlaps at this position
        const overlapCount = positionEvents.length;
        
        // Adjust width and position for all events at this position
        positionEvents.forEach((event, index) => {
          layouts[event.id].width = 100 / overlapCount;
          layouts[event.id].left = (100 / overlapCount) * index;
          layouts[event.id].overlappingEvents = overlapCount;
        });
      }
    });
    
    return layouts;
  }, [events, selectedDate]);
}
