import { Event } from '@/types';
import { 
  isWithinInterval, isBefore, isAfter, 
  startOfDay, endOfDay, isSameDay
} from 'date-fns';

/**
 * Filters events for a specific date, including those that overlap midnight
 */
export const filterEventsForDate = (events: Event[], date: Date): Event[] => {
  // Filter events for the selected day including those that overlap with midnight
  const filteredEvents = events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    // Check if the event overlaps with the selected day
    return (
      // Event starts within the day
      isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
      // Event ends within the day
      isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
      // Event spans over the entire day
      (isBefore(eventStart, dayStart) && isAfter(eventEnd, dayEnd)) ||
      // Exact day matches
      isSameDay(eventStart, date) || 
      isSameDay(eventEnd, date)
    );
  }).sort((a, b) => {
    // Sort by all-day first, then by start time
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
  
  return filteredEvents;
};

/**
 * Filters out duplicate sleep events with the same times
 */
export const filterDuplicateSleepEvents = (events: Event[]): Event[] => {
  // Track unique sleep events by their start and end times
  const sleepEventKeys = new Set<string>();
  
  return events.filter(event => {
    // Keep all non-sleep events
    if (event.title !== 'Sleep') return true;
    
    // For sleep events, create a unique key based on start and end times
    const sleepKey = `sleep-${event.start.getTime()}-${event.end.getTime()}`;
    
    // If we haven't seen this sleep event before, keep it
    if (!sleepEventKeys.has(sleepKey)) {
      sleepEventKeys.add(sleepKey);
      return true;
    }
    
    // Filter out duplicate sleep events
    return false;
  });
};
