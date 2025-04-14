
import { Event as CalendarEvent } from '@/types';
import { 
  isWithinInterval, isBefore, isAfter, 
  startOfDay, endOfDay, isSameDay, isEqual,
  differenceInCalendarDays, addDays
} from 'date-fns';

/**
 * Filters events for a specific date, including those that overlap midnight
 */
export const filterEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  console.log(`Filtering events for date: ${date.toISOString()}, total events: ${events.length}`);
  
  // Filter events for the selected day including those that overlap with midnight
  const filteredEvents = events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    // Check if the event overlaps with the selected day
    const overlaps = (
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
    
    if (overlaps && event.id.includes('debug')) {
      console.log(`Event ${event.title} overlaps with ${date.toISOString()}`, {
        eventStart,
        eventEnd,
        dayStart,
        dayEnd,
        conditions: {
          startsWithinDay: isWithinInterval(eventStart, { start: dayStart, end: dayEnd }),
          endsWithinDay: isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }),
          spansEntireDay: (isBefore(eventStart, dayStart) && isAfter(eventEnd, dayEnd)),
          sameDayStart: isSameDay(eventStart, date),
          sameDayEnd: isSameDay(eventEnd, date)
        }
      });
    }
    
    return overlaps;
  }).sort((a, b) => {
    // Sort by all-day first, then by start time
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
  
  console.log(`Filtered ${filteredEvents.length} events for ${date.toISOString()}`);
  return filteredEvents;
};

/**
 * Filter out duplicate sleep events
 * Uses a stringified key to detect duplicates by date and time
 */
export function filterDuplicateSleepEvents(events: CalendarEvent[]): CalendarEvent[] {
  // This function will be removed as we're removing sleep schedule
  return events;
}

/**
 * Split multi-day events into segments for each day they span
 */
export const splitMultiDayEvents = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  console.log(`Splitting multi-day events for ${date.toISOString()}`);
  const result: CalendarEvent[] = [];
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
      });
    } 
    // If the event ends on this day
    else if (isSameDay(eventEnd, date)) {
      const segmentStart = new Date(dayStart);
      result.push({
        ...event,
        start: segmentStart,
        isSegment: true,
        segmentType: 'end'
      });
    }
    // If the day is in the middle of a multi-day event
    else if (isWithinInterval(date, { start: eventStart, end: eventEnd })) {
      result.push({
        ...event,
        start: new Date(dayStart),
        end: new Date(dayEnd),
        isSegment: true,
        segmentType: 'middle'
      });
    }
  });
  
  console.log(`Processed ${result.length} events for ${date.toISOString()} after splitting`);
  return result;
};

/**
 * Debug helper: logs event details
 */
export const logEventDetails = (event: CalendarEvent, label: string = "Event detail"): void => {
  console.group(`🔍 ${label} - ${event.title}`);
  console.log(`ID: ${event.id}`);
  console.log(`Start: ${event.start.toString()}`);
  console.log(`End: ${event.end.toString()}`);
  console.log(`All day: ${event.allDay}`);
  console.log(`Color: ${event.color}`);
  console.log(`Is segment: ${event.isSegment ? `Yes (${event.segmentType})` : 'No'}`);
  console.groupEnd();
};
