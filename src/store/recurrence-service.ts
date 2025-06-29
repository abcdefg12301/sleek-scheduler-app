
import { Event, RecurrenceRule } from '@/types';
import { 
  addDays, addWeeks, addMonths, addYears, 
  isBefore, isAfter, isWithinInterval, isSameDay, differenceInDays, isValid,
  format, startOfDay, endOfDay
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
  // Also check the recurrence end date if it exists
  let currentStart = getNextOccurrence(originalStart, frequency, interval);
  let iterationCount = 0;
  const maxIterations = 1000; // Safety limit
  
  // Generate occurrences only within the requested date range
  while (isBefore(currentStart, endDate) && 
        (!event.recurrence.endDate || isBefore(currentStart, event.recurrence.endDate)) &&
        iterationCount < maxIterations) {
    
    iterationCount++;
    
    // Skip this occurrence if it's an exception date
    if (isExceptionDate(currentStart)) {
      currentStart = getNextOccurrence(currentStart, frequency, interval);
      continue;
    }
    
    // Calculate the end time for this occurrence
    const currentEnd = new Date(currentStart.getTime() + eventDurationMs);
    
    // Skip if the current occurrence is completely before the requested range
    if (isAfter(currentStart, startDate) || isSameDay(currentStart, startDate) || 
        (isBefore(currentStart, startDate) && isAfter(currentEnd, startDate))) {
      
      // Create a new instance of the recurring event with unique ID
      const instanceId = `${event.id}-recurrence-${format(currentStart, 'yyyy-MM-dd-HH-mm')}`;
      
      // Check if we already have this instance to prevent duplicates
      const existingInstance = events.find(e => e.id === instanceId);
      if (!existingInstance) {
        const newEvent: Event = {
          ...event,
          id: instanceId,
          start: new Date(currentStart),
          end: new Date(currentEnd),
          isRecurrenceInstance: true,
          originalEventId: event.id
        };
        
        events.push(newEvent);
      }
    }
    
    // Move to next occurrence
    currentStart = getNextOccurrence(currentStart, frequency, interval);
  }
  
  if (iterationCount >= maxIterations) {
    console.warn('Maximum iterations reached for recurring event generation');
  }
  
  return events;
};
