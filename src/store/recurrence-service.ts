
import { Event, RecurrenceRule } from '@/types';
import { 
  addDays, addWeeks, addMonths, addYears, 
  isBefore, isAfter, isWithinInterval, isSameDay, differenceInDays, isValid
} from 'date-fns';

// Helper to get the next occurrence based on frequency
export const getNextOccurrence = (date: Date, frequency: string, interval: number): Date => {
  switch (frequency) {
    case 'daily':
      return addDays(date, interval);
    case 'weekly':
      return addWeeks(date, interval);
    case 'monthly':
      return addMonths(date, interval);
    case 'yearly':
      return addYears(date, interval);
    default:
      return addDays(date, interval);
  }
};

// Helper functions for generating recurring events
export const generateRecurringEvents = (event: Event, startDate: Date, endDate: Date): Event[] => {
  if (!event.recurrence) return [event];
  
  // Make sure we're working with valid dates
  if (!isValid(new Date(event.start)) || !isValid(new Date(event.end))) {
    console.error('Invalid date in recurring event:', event);
    return [event];
  }
  
  const events: Event[] = [];
  const { frequency, interval = 1 } = event.recurrence;
  
  const originalStart = new Date(event.start);
  const originalEnd = new Date(event.end);
  const eventDurationMs = originalEnd.getTime() - originalStart.getTime();

  // Include the original event if it's within range
  if ((isWithinInterval(originalStart, { start: startDate, end: endDate }) || 
       isWithinInterval(originalEnd, { start: startDate, end: endDate }) ||
       isSameDay(originalStart, startDate) ||
       (isBefore(originalStart, startDate) && isAfter(originalEnd, startDate)))) {
    events.push(event);
  }

  // Loop and generate recurring events but only up to the requested end date
  let currentStart = getNextOccurrence(originalStart, frequency, interval);
  
  // Generate occurrences only within the requested date range
  // No limit on how many recurrences we generate - we only limit by the view range
  while (isBefore(currentStart, endDate)) {
    // Skip if the current occurrence is before the requested range
    if (isAfter(currentStart, startDate) || isSameDay(currentStart, startDate) || 
        (isBefore(currentStart, startDate) && isAfter(new Date(currentStart.getTime() + eventDurationMs), startDate))) {
      
      const currentEnd = new Date(currentStart.getTime() + eventDurationMs);
      
      // Create a new instance of the recurring event
      const newEvent: Event = {
        ...event,
        id: `${event.id}-recurrence-${currentStart.getTime()}`,
        start: new Date(currentStart),
        end: new Date(currentEnd),
        isRecurrenceInstance: true,
        originalEventId: event.id
      };
      
      events.push(newEvent);
    }
    
    // Move to next occurrence
    currentStart = getNextOccurrence(currentStart, frequency, interval);
  }
  
  return events;
};
