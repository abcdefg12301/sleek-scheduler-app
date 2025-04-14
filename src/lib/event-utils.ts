import { Event } from '@/types';
import { 
  isWithinInterval, isBefore, isAfter, 
  startOfDay, endOfDay, isSameDay, isEqual,
  differenceInCalendarDays, addDays
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
 * Filter out duplicate sleep events
 * Uses a stringified key to detect duplicates by date and time
 */
export function filterDuplicateSleepEvents(events: Event[]): Event[] {
  // Use a map to track unique sleep events by their time + day combination
  const uniqueSleepEvents = new Map<string, Event>();
  const nonSleepEvents: Event[] = [];
  
  events.forEach(event => {
    if (event.isSleep) {
      // Create a unique key for this sleep event using date + times
      const startDay = startOfDay(event.start).getTime();
      const key = `sleep-${startDay}`;
      
      if (!uniqueSleepEvents.has(key)) {
        uniqueSleepEvents.set(key, event);
      }
    } else {
      nonSleepEvents.push(event);
    }
  });
  
  // Return the non-sleep events plus exactly one sleep event per day
  return [...nonSleepEvents, ...uniqueSleepEvents.values()];
}

/**
 * Split multi-day events into segments for each day they span
 */
export const splitMultiDayEvents = (events: Event[], date: Date): Event[] => {
  const result: Event[] = [];
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  events.forEach(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // If it's an all-day event or doesn't span midnight, keep it as is
    if (event.allDay || isSameDay(eventStart, eventEnd)) {
      result.push(event);
      return;
    }
    
    // For events that span days:
    // If the event starts on this day
    if (isSameDay(eventStart, date)) {
      const segmentEnd = new Date(dayEnd);
      result.push({
        ...event,
        end: segmentEnd,
        isSegment: true,
        segmentType: 'start'
      } as Event);
    } 
    // If the event ends on this day
    else if (isSameDay(eventEnd, date)) {
      const segmentStart = new Date(dayStart);
      result.push({
        ...event,
        start: segmentStart,
        isSegment: true,
        segmentType: 'end'
      } as Event);
    }
    // If the day is in the middle of a multi-day event
    else if (isWithinInterval(date, { start: eventStart, end: eventEnd })) {
      result.push({
        ...event,
        start: new Date(dayStart),
        end: new Date(dayEnd),
        isSegment: true,
        segmentType: 'middle'
      } as Event);
    }
  });
  
  return result;
};
