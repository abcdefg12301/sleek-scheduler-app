
import { Calendar, Event, Holiday } from '../types';
import { addDays, isSameDay, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { eventService } from './event-service';
import { sleepService } from './sleep-service';
import { holidayService } from './holiday-service';
import { filterDuplicateSleepEvents } from '@/lib/event-utils';

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
    
    // Then collect all sleep events from all calendars
    const sleepEvents: Event[] = [];
    calendars.forEach(calendar => {
      // Get sleep events if enabled
      if (calendar.sleepSchedule?.enabled) {
        const calendarSleepEvents = sleepService.getSleepEventsForDate(calendar.id, calendar.sleepSchedule, date);
        sleepEvents.push(...calendarSleepEvents);
      }
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
    
    // Deduplicate sleep events before adding to results
    const uniqueSleepEvents = filterDuplicateSleepEvents(sleepEvents);
    allEvents = [...allEvents, ...uniqueSleepEvents];
    
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
    
    // Then collect all sleep events from all calendars
    const sleepEvents: Event[] = [];
    calendars.forEach(calendar => {
      // Get sleep events if enabled
      if (calendar.sleepSchedule?.enabled) {
        const calendarSleepEvents = sleepService.getSleepEventsForDateRange(calendar.id, calendar.sleepSchedule, startDate, endDate);
        sleepEvents.push(...calendarSleepEvents);
      }
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
    
    // Deduplicate sleep events before adding to results
    const uniqueSleepEvents = filterDuplicateSleepEvents(sleepEvents);
    allEvents = [...allEvents, ...uniqueSleepEvents];
    
    // Sort events
    return eventService.sortEvents(allEvents);
  }
};
