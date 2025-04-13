
import { Event } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { 
  isWithinInterval, isBefore, isAfter, 
  startOfDay, endOfDay, isSameDay 
} from 'date-fns';
import { generateRecurringEvents } from './recurrence-service';

/**
 * Service to handle event-related operations
 */
export const eventService = {
  /**
   * Creates a new event with a unique ID
   */
  createEvent: (calendarId: string, eventData: Omit<Event, 'id' | 'calendarId'>): Event => {
    return {
      id: uuidv4(),
      calendarId,
      ...eventData
    };
  },
  
  /**
   * Expands recurring events for a given date range
   */
  getExpandedEvents: (events: Event[], startDate: Date, endDate: Date): Event[] => {
    let expandedEvents: Event[] = [];
    
    // Process each event
    events.forEach(event => {
      // For recurring events, generate instances
      if (event.recurrence) {
        const recurrences = generateRecurringEvents(event, startDate, endDate);
        expandedEvents = [...expandedEvents, ...recurrences];
      } 
      // For normal events, check if they fall within range
      else {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        
        // Check if the event overlaps with the date range
        if (isWithinInterval(eventStart, { start: startDate, end: endDate }) || 
            isWithinInterval(eventEnd, { start: startDate, end: endDate }) ||
            (isBefore(eventStart, startDate) && isAfter(eventEnd, endDate)) ||
            isSameDay(eventStart, startDate) || 
            isSameDay(eventEnd, startDate)) {
          expandedEvents.push(event);
        }
      }
    });
    
    return expandedEvents;
  },
  
  /**
   * Sorts events: all-day first, then by start time
   * Also filters out duplicate sleep events
   */
  sortEvents: (events: Event[]): Event[] => {
    // First deduplicate sleep events
    const uniqueSleepEvents = new Map<string, Event>();
    const nonSleepEvents: Event[] = [];
    
    events.forEach(event => {
      if (event.title === 'Sleep') {
        const key = `${event.start.getTime()}-${event.end.getTime()}`;
        if (!uniqueSleepEvents.has(key)) {
          uniqueSleepEvents.set(key, event);
        }
      } else {
        nonSleepEvents.push(event);
      }
    });
    
    // Combine and sort all events
    const combinedEvents = [...nonSleepEvents, ...uniqueSleepEvents.values()];
    
    return combinedEvents.sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  }
};
