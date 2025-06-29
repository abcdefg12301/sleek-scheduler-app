
import { Calendar, Event, Holiday } from '@/types';
import { eventService } from './event-service';
import { holidayService } from './holiday-service';
import { 
  isWithinInterval, isBefore, isAfter, 
  startOfDay, endOfDay, isSameDay 
} from 'date-fns';

/**
 * Service to handle calendar-wide event operations
 */
export const calendarEventService = {
  /**
   * Get all events for a specific date across all calendars
   */
  getEventsForDate: (calendars: Calendar[], date: Date, holidays: Holiday[]): Event[] => {
    const allEvents: Event[] = [];
    
    calendars.forEach(calendar => {
      // Get expanded events for this specific calendar only
      const calendarEvents = eventService.getExpandedEvents(
        calendar.events, 
        startOfDay(date), 
        endOfDay(date)
      );
      
      // Filter events to only include those for this calendar
      const filteredEvents = calendarEvents.filter(event => 
        event.calendarId === calendar.id
      );
      
      allEvents.push(...filteredEvents);
      
      // Add holidays if enabled for this calendar
      if (calendar.showHolidays) {
        const holidayEvents = holidayService.getHolidaysForDate(holidays, date);
        // Convert holidays to events with the correct calendar ID
        const calendarHolidays = holidayEvents.map(holiday => 
          holidayService.holidayToEvent(holiday, calendar.id)
        );
        allEvents.push(...calendarHolidays);
      }
    });
    
    return eventService.sortEvents(allEvents);
  },
  
  /**
   * Get all events for a date range across all calendars
   */
  getEventsForDateRange: (calendars: Calendar[], startDate: Date, endDate: Date, holidays: Holiday[]): Event[] => {
    const allEvents: Event[] = [];
    
    calendars.forEach(calendar => {
      // Get expanded events for this specific calendar only
      const calendarEvents = eventService.getExpandedEvents(
        calendar.events, 
        startDate, 
        endDate
      );
      
      // Filter events to only include those for this calendar
      const filteredEvents = calendarEvents.filter(event => 
        event.calendarId === calendar.id
      );
      
      allEvents.push(...filteredEvents);
      
      // Add holidays if enabled for this calendar
      if (calendar.showHolidays) {
        const holidayEvents = holidayService.getHolidaysForDateRange(startDate, endDate, holidays);
        // Convert holidays to events with the correct calendar ID
        const calendarHolidays = holidayEvents.map(holiday => 
          holidayService.holidayToEvent(holiday, calendar.id)
        );
        allEvents.push(...calendarHolidays);
      }
    });
    
    return eventService.sortEvents(allEvents);
  },

  /**
   * Get events for a specific calendar and date range
   */
  getEventsForCalendarAndDateRange: (calendar: Calendar, startDate: Date, endDate: Date, holidays: Holiday[]): Event[] => {
    const events: Event[] = [];
    
    // Get expanded events for this calendar
    const calendarEvents = eventService.getExpandedEvents(
      calendar.events, 
      startDate, 
      endDate
    );
    
    // Filter to ensure only events for this calendar
    const filteredEvents = calendarEvents.filter(event => 
      event.calendarId === calendar.id
    );
    
    events.push(...filteredEvents);
    
    // Add holidays if enabled
    if (calendar.showHolidays) {
      const holidayEvents = holidayService.getHolidaysForDateRange(startDate, endDate, holidays);
      const calendarHolidays = holidayEvents.map(holiday => 
        holidayService.holidayToEvent(holiday, calendar.id)
      );
      events.push(...calendarHolidays);
    }
    
    return eventService.sortEvents(events);
  }
};
