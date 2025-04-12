
import { Event, SleepSchedule } from '@/types';
import { setMinutes, setHours, addDays, startOfDay, endOfDay, differenceInDays, format } from 'date-fns';

// Helper to generate sleep events based on schedule
export const generateSleepEvents = (
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
  
  // Generate sleep events for each day in the date range
  let currentDate = startOfDay(new Date(startDate));
  const rangeEndDate = endOfDay(new Date(endDate));
  
  // Calculate how many days to process - limit to a reasonable number for very large ranges
  const daysToProcess = Math.min(
    differenceInDays(rangeEndDate, currentDate) + 1,
    365 // Cap at 1 year - this is a reasonable limit for UI display
  );
  
  for (let i = 0; i < daysToProcess; i++) {
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
    
    // Create sleep event for this day
    const sleepEvent: Event = {
      id: `sleep-${calendarId}-${format(currentDate, 'yyyy-MM-dd')}`,
      calendarId,
      title: 'Sleep',
      description: 'Sleep time',
      start: sleepStart,
      end: sleepEnd,
      allDay: false,
      color: '#3730a3' // Deep purple for sleep
    };
    
    events.push(sleepEvent);
    
    // Move to next day
    currentDate = addDays(currentDate, 1);
  }
  
  return events;
};

// Get sleep events for a specific date
export const getSleepEventsForDate = (
  calendarId: string,
  sleepSchedule: SleepSchedule,
  date: Date
): Event[] => {
  if (!sleepSchedule?.enabled) return [];
  
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  return generateSleepEvents(calendarId, sleepSchedule, dayStart, dayEnd);
};

// Get sleep events for a date range
export const getSleepEventsForDateRange = (
  calendarId: string,
  sleepSchedule: SleepSchedule,
  startDate: Date,
  endDate: Date
): Event[] => {
  if (!sleepSchedule?.enabled) return [];
  
  return generateSleepEvents(calendarId, sleepSchedule, startDate, endDate);
};
