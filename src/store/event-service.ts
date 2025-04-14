
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
    console.log(`Creating new event for calendar ${calendarId}:`, eventData);
    
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
    console.log(`Expanding events from ${events.length} base events`);
    
    // Process each event
    events.forEach(event => {
      // For recurring events, generate instances
      if (event.recurrence) {
        console.log(`Expanding recurring event: ${event.title}`);
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
    
    console.log(`Expanded to ${expandedEvents.length} total events`);
    return expandedEvents;
  },
  
  /**
   * Sorts events: all-day first, then by start time
   */
  sortEvents: (events: Event[]): Event[] => {
    return events.sort((a, b) => {
      // Sort by all-day first
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      
      // Then by start time
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  }
};
