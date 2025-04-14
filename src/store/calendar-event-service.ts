
import { Calendar, Event, Holiday } from '../types';
import { addDays, isSameDay, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { eventService } from './event-service';
import { holidayService } from './holiday-service';

/**
 * Service to consolidate event gathering logic from calendar-store
 */
export const calendarEventService = {
  /**
   * Get all events for a specific date across all calendars
   */
  getEventsForDate: (calendars: Calendar[], date: Date, holidays: Holiday[]): Event[] => {
    let allEvents: Event[] = [];
    const processedHolidays = new Set<string>();
    
    // First collect regular events from all calendars
    calendars.forEach(calendar => {
      // Get regular events (including recurring)
      const expandedEvents = eventService.getExpandedEvents(calendar.events, date, date);
      allEvents.push(...expandedEvents);
    });
    
    // Then collect holiday events (only once per holiday)
    calendars.forEach(calendar => {
      // Add holiday events if enabled
      if (calendar.showHolidays) {
        const holidaysForDate = holidayService.getHolidaysForDate(holidays, date);
        
        holidaysForDate.forEach(holiday => {
          // Only add each holiday once
          if (!processedHolidays.has(holiday.id)) {
            processedHolidays.add(holiday.id);
            const holidayEvent = holidayService.holidayToEvent(holiday, calendar.id);
            allEvents.push(holidayEvent);
          }
        });
      }
    });
    
    // Sort events
    return eventService.sortEvents(allEvents);
  },
  
  /**
   * Get all events for a date range across all calendars
   */
  getEventsForDateRange: (calendars: Calendar[], startDate: Date, endDate: Date, holidays: Holiday[]): Event[] => {
    let allEvents: Event[] = [];
    const processedHolidays = new Set<string>();
    
    // First collect regular events from all calendars
    calendars.forEach(calendar => {
      // Get regular events (including recurring)
      const expandedEvents = eventService.getExpandedEvents(calendar.events, startDate, endDate);
      allEvents.push(...expandedEvents);
    });
    
    // Then collect holiday events (only once per holiday)
    calendars.forEach(calendar => {
      // Add holiday events if enabled
      if (calendar.showHolidays) {
        // For each day in the range, check for holidays
        let currentDate = startOfDay(new Date(startDate));
        const rangeEndDate = endOfDay(new Date(endDate));
        
        while (currentDate <= rangeEndDate) {
          const holidaysForDate = holidayService.getHolidaysForDate(holidays, currentDate);
          
          holidaysForDate.forEach(holiday => {
            // Only add each holiday once
            if (!processedHolidays.has(holiday.id)) {
              processedHolidays.add(holiday.id);
              const holidayEvent = holidayService.holidayToEvent(holiday, calendar.id);
              allEvents.push(holidayEvent);
            }
          });
          
          currentDate = addDays(currentDate, 1);
        }
      }
    });
    
    // Sort events
    return eventService.sortEvents(allEvents);
  }
};
