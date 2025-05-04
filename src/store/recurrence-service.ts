
import { Event, RecurrenceRule } from '@/types';
import { 
  addDays, addWeeks, addMonths, addYears, 
  isBefore, isAfter, isWithinInterval, isSameDay, differenceInDays, isValid,
  format
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
  
  // Get the exception dates if they exist
  const exceptionDates = event.exceptionDates || [];

  // Check if a date is an exception date
  const isExceptionDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return exceptionDates.includes(dateStr);
  };

  // Include the original event if it's within range and not an exception date
  if ((isWithinInterval(originalStart, { start: startDate, end: endDate }) || 
       isWithinInterval(originalEnd, { start: startDate, end: endDate }) ||
       isSameDay(originalStart, startDate) ||
       (isBefore(originalStart, startDate) && isAfter(originalEnd, startDate))) &&
      !isExceptionDate(originalStart)) {
    events.push(event);
  }

  // Loop and generate recurring events but only up to the requested end date
  let currentStart = getNextOccurrence(originalStart, frequency, interval);
  
  // Generate occurrences only within the requested date range
  // Also check the recurrence end date if it exists
  while (isBefore(currentStart, endDate) && 
        (!event.recurrence.endDate || isBefore(currentStart, event.recurrence.endDate))) {
    
    // Skip this occurrence if it's an exception date
    if (isExceptionDate(currentStart)) {
      currentStart = getNextOccurrence(currentStart, frequency, interval);
      continue;
    }
    
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
    
    // Add a safeguard to prevent infinite loops (e.g. when using count)
    if (events.length >= 100) {
      console.warn('Too many recurrences generated, limiting to 100');
      break;
    }
  }
  
  return events;
};
