
import { Event, RecurrenceRule } from '@/types';
import { 
  addDays, addWeeks, addMonths, addYears, 
  isBefore, isAfter, isWithinInterval, isSameDay, differenceInDays, isValid,
  format, startOfDay, endOfDay, isSameMinute, startOfMinute
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

  // For cross-day events, we need special handling to avoid duplicates
  const isCrossDayEvent = originalStart.getDate() !== originalEnd.getDate() || 
                         originalStart.getMonth() !== originalEnd.getMonth() ||
                         originalStart.getFullYear() !== originalEnd.getFullYear();

  console.log('Generating recurring events for:', event.title, 'Cross-day:', isCrossDayEvent);

  // Include the original event if it's within range and not an exception date
  if ((isWithinInterval(originalStart, { start: startDate, end: endDate }) || 
       isWithinInterval(originalEnd, { start: startDate, end: endDate }) ||
       isSameDay(originalStart, startDate) ||
       (isBefore(originalStart, startDate) && isAfter(originalEnd, startDate))) &&
      !isExceptionDate(originalStart)) {
    events.push(event);
  }

  // Generate recurring instances
  let currentStart = getNextOccurrence(originalStart, frequency, interval);
  let iterationCount = 0;
  const maxIterations = 1000; // Safety limit
  
  // Keep track of generated instances to prevent duplicates for cross-day events
  const generatedInstances = new Set<string>();
  
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
    
    // Create a unique key for this instance
    // For cross-day events, use only the start date and time to prevent duplicates
    // For same-day events, use full timestamp
    const instanceKey = isCrossDayEvent 
      ? `${event.id}-${format(currentStart, 'yyyy-MM-dd-HH-mm')}`
      : `${event.id}-${format(currentStart, 'yyyy-MM-dd-HH-mm-ss')}`;
    
    // Skip if we've already generated this instance
    if (generatedInstances.has(instanceKey)) {
      console.log('Skipping duplicate instance:', instanceKey);
      currentStart = getNextOccurrence(currentStart, frequency, interval);
      continue;
    }
    
    // Check if the current occurrence overlaps with the requested range
    const isInRange = isWithinInterval(currentStart, { start: startDate, end: endDate }) || 
                     isWithinInterval(currentEnd, { start: startDate, end: endDate }) ||
                     (isBefore(currentStart, startDate) && isAfter(currentEnd, startDate)) ||
                     isSameDay(currentStart, startDate) || 
                     isSameDay(currentEnd, endDate);
    
    if (isInRange) {
      // Create a new instance of the recurring event with unique ID
      const instanceId = `${event.id}-recurrence-${format(currentStart, 'yyyy-MM-dd-HH-mm')}`;
      
      const newEvent: Event = {
        ...event,
        id: instanceId,
        start: new Date(currentStart),
        end: new Date(currentEnd),
        isRecurrenceInstance: true,
        originalEventId: event.id
      };
      
      events.push(newEvent);
      generatedInstances.add(instanceKey);
      
      console.log('Generated instance:', instanceKey, 'Start:', format(currentStart, 'yyyy-MM-dd HH:mm'), 'End:', format(currentEnd, 'yyyy-MM-dd HH:mm'));
    }
    
    // Move to next occurrence
    currentStart = getNextOccurrence(currentStart, frequency, interval);
  }
  
  if (iterationCount >= maxIterations) {
    console.warn('Maximum iterations reached for recurring event generation');
  }
  
  console.log(`Generated ${events.length} total events for ${event.title}`);
  return events;
};
