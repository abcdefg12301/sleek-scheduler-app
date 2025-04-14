
import { Event, SleepSchedule } from '@/types';
import { setMinutes, setHours, addDays, startOfDay, endOfDay, differenceInDays, format } from 'date-fns';

/**
 * Service to handle sleep schedule related operations
 */
export const sleepService = {
  /**
   * Generates sleep events based on schedule for a date range
   */
  generateSleepEvents: (
    calendarId: string, 
    sleepSchedule: SleepSchedule, 
    startDate: Date, 
    endDate: Date
  ): Event[] => {
    if (!sleepSchedule || !sleepSchedule.enabled) return [];
    
    const events: Event[] = [];
    const [sleepHour, sleepMinute] = sleepSchedule.startTime.split(':').map(Number);
    const [wakeHour, wakeMinute] = sleepSchedule.endTime.split(':').map(Number);
    
    // Determine if sleep crosses midnight
    const sleepCrossesMidnight = 
      (wakeHour < sleepHour) || 
      (wakeHour === sleepHour && wakeMinute <= sleepMinute);
    
    // Generate one sleep event per day in the date range
    let currentDate = startOfDay(new Date(startDate));
    const rangeEndDate = endOfDay(new Date(endDate));
    
    // Calculate how many days to process - limit to a reasonable number for very large ranges
    const daysToProcess = Math.min(
      differenceInDays(rangeEndDate, currentDate) + 1,
      365 // Cap at 1 year - this is a reasonable limit for UI display
    );
    
    // Track days we've already created sleep events for to avoid duplicates
    const processedDays = new Set<string>();
    
    for (let i = 0; i < daysToProcess; i++) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      
      // Skip if we already created a sleep event for this day
      if (!processedDays.has(dateKey)) {
        // Create sleep event start time (today's date + sleep time)
        const sleepStart = setMinutes(setHours(new Date(currentDate), sleepHour), sleepMinute);
        
        // Create sleep event end time
        let sleepEnd;
        if (sleepCrossesMidnight) {
          // If crossing midnight, end time is next day
          sleepEnd = setMinutes(setHours(addDays(new Date(currentDate), 1), wakeHour), wakeMinute);
        } else {
          // Same day
          sleepEnd = setMinutes(setHours(new Date(currentDate), wakeHour), wakeMinute);
        }
        
        // Create a unique ID based on the day to help with deduplication
        const uniqueId = `sleep-${calendarId}-${dateKey}`;
        
        // Create sleep event for this day
        const sleepEvent: Event = {
          id: uniqueId,
          calendarId,
          title: 'Sleep',
          description: 'Sleep time',
          start: sleepStart,
          end: sleepEnd,
          allDay: false,
          color: '#3730a3', // Deep purple for sleep
          isSleep: true // Mark as sleep event
        };
        
        events.push(sleepEvent);
        processedDays.add(dateKey);
      }
      
      // Move to next day
      currentDate = addDays(currentDate, 1);
    }
    
    return events;
  },

  /**
   * Gets sleep events for a specific date
   */
  getSleepEventsForDate: (
    calendarId: string,
    sleepSchedule: SleepSchedule,
    date: Date
  ): Event[] => {
    if (!sleepSchedule?.enabled) return [];
    
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    return sleepService.generateSleepEvents(calendarId, sleepSchedule, dayStart, dayEnd);
  },

  /**
   * Gets sleep events for a date range
   */
  getSleepEventsForDateRange: (
    calendarId: string,
    sleepSchedule: SleepSchedule,
    startDate: Date,
    endDate: Date
  ): Event[] => {
    if (!sleepSchedule?.enabled) return [];
    
    return sleepService.generateSleepEvents(calendarId, sleepSchedule, startDate, endDate);
  }
};
