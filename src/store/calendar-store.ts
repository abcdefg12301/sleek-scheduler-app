
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calendar, Event, SleepSchedule, Holiday, RecurrenceRule } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  addDays, addWeeks, addMonths, addYears, 
  format, isSameDay, startOfDay, endOfDay, 
  isWithinInterval, isBefore, isAfter, 
  differenceInDays, getYear, getMonth, getDate,
  setHours, setMinutes, isValid 
} from 'date-fns';

interface CalendarState {
  calendars: Calendar[];
  selectedCalendarId: string | null;
  holidays: Holiday[];
  
  // Calendar actions
  addCalendar: (name: string, description: string, color: string, showHolidays?: boolean, sleepSchedule?: SleepSchedule) => Calendar;
  updateCalendar: (id: string, data: Partial<Calendar>) => void;
  deleteCalendar: (id: string) => void;
  selectCalendar: (id: string | null) => void;
  
  // Event actions
  addEvent: (calendarId: string, event: Omit<Event, 'id' | 'calendarId'>) => Event;
  updateEvent: (calendarId: string, eventId: string, data: Partial<Event>) => void;
  deleteEvent: (calendarId: string, eventId: string) => void;
  getEventsForDate: (date: Date) => Event[];
  getEventsForDateRange: (startDate: Date, endDate: Date) => Event[];
  getExpandedEvents: (calendarId: string, startDate: Date, endDate: Date) => Event[];
  
  // Holiday actions
  initializeHolidays: () => void;
  getHolidaysForCalendar: (calendarId: string, date: Date) => Holiday[];
  
  // Sleep schedule
  updateSleepSchedule: (calendarId: string, sleepSchedule: SleepSchedule) => void;
  getSleepEventsForDate: (calendarId: string, date: Date) => Event[];
  getSleepEventsForDateRange: (calendarId: string, startDate: Date, endDate: Date) => Event[];
}

const HOLIDAYS: Holiday[] = [
  { id: "1", name: "New Year's Day", date: new Date(new Date().getFullYear(), 0, 1), type: "public" },
  { id: "2", name: "Martin Luther King Jr. Day", date: new Date(new Date().getFullYear(), 0, 16), type: "public" },
  { id: "3", name: "Valentine's Day", date: new Date(new Date().getFullYear(), 1, 14), type: "observance" },
  { id: "4", name: "Presidents Day", date: new Date(new Date().getFullYear(), 1, 20), type: "public" },
  { id: "5", name: "Memorial Day", date: new Date(new Date().getFullYear(), 4, 29), type: "public" },
  { id: "6", name: "Independence Day", date: new Date(new Date().getFullYear(), 6, 4), type: "public" },
  { id: "7", name: "Labor Day", date: new Date(new Date().getFullYear(), 8, 4), type: "public" },
  { id: "8", name: "Columbus Day", date: new Date(new Date().getFullYear(), 9, 9), type: "public" },
  { id: "9", name: "Halloween", date: new Date(new Date().getFullYear(), 9, 31), type: "observance" },
  { id: "10", name: "Veterans Day", date: new Date(new Date().getFullYear(), 10, 11), type: "public" },
  { id: "11", name: "Thanksgiving Day", date: new Date(new Date().getFullYear(), 10, 23), type: "public" },
  { id: "12", name: "Christmas Eve", date: new Date(new Date().getFullYear(), 11, 24), type: "observance" },
  { id: "13", name: "Christmas Day", date: new Date(new Date().getFullYear(), 11, 25), type: "public" }
];

// Helper functions for generating recurring events
const generateRecurringEvents = (event: Event, startDate: Date, endDate: Date): Event[] => {
  if (!event.recurrence) return [event];
  
  // Make sure we're working with valid dates
  if (!isValid(new Date(event.start)) || !isValid(new Date(event.end))) {
    console.error('Invalid date in recurring event:', event);
    return [event];
  }
  
  const events: Event[] = [];
  const { frequency, interval = 1, count, endDate: recurrenceEndDate } = event.recurrence;
  
  const originalStart = new Date(event.start);
  const originalEnd = new Date(event.end);
  const duration = differenceInDays(originalEnd, originalStart);
  const eventDurationMs = originalEnd.getTime() - originalStart.getTime();

  // Determine the actual end date for the recurrence
  let maxDate = recurrenceEndDate ? new Date(recurrenceEndDate) : addYears(endDate, 5); // Use a reasonable limit for infinite recurrences
  if (count) {
    const lastDate = getLastRecurrenceDate(originalStart, frequency, interval, count);
    if (isBefore(lastDate, maxDate)) {
      maxDate = lastDate;
    }
  }

  // Include the original event if it's within range
  if ((isWithinInterval(originalStart, { start: startDate, end: maxDate }) || 
       isWithinInterval(originalEnd, { start: startDate, end: maxDate }) ||
       isSameDay(originalStart, startDate) ||
       (isBefore(originalStart, startDate) && isAfter(originalEnd, startDate)))) {
    events.push(event);
  }

  // Loop and generate recurring events
  let recurrenceCount = 1; // Start from 1 because we already checked the original event
  let currentStart = getNextOccurrence(originalStart, frequency, interval);
  
  while (recurrenceCount < (count || Number.MAX_SAFE_INTEGER) && isBefore(currentStart, maxDate)) {
    // Skip if the current occurrence is before the requested range
    if (isAfter(currentStart, startDate) || isSameDay(currentStart, startDate) || 
        (isBefore(currentStart, startDate) && isAfter(new Date(currentStart.getTime() + eventDurationMs), startDate))) {
      
      const currentEnd = new Date(currentStart.getTime() + eventDurationMs);
      
      // Create a new instance of the recurring event
      const newEvent: Event = {
        ...event,
        id: `${event.id}-recurrence-${recurrenceCount}`,
        start: new Date(currentStart),
        end: new Date(currentEnd),
        isRecurrenceInstance: true,
        originalEventId: event.id
      };
      
      events.push(newEvent);
    }
    
    // Move to next occurrence
    recurrenceCount++;
    currentStart = getNextOccurrence(currentStart, frequency, interval);
  }
  
  return events;
};

// Helper to get the next occurrence based on frequency
const getNextOccurrence = (date: Date, frequency: string, interval: number): Date => {
  switch (frequency) {
    case 'daily':
      return addDays(date, interval);
    case 'weekly':
      return addWeeks(date, interval);
    case 'monthly':
      return addMonths(date, interval);
    case 'yearly':
      return addYears(date, interval);
    default:
      return addDays(date, interval);
  }
};

// Helper to calculate the last date in a recurrence pattern
const getLastRecurrenceDate = (startDate: Date, frequency: string, interval = 1, count: number): Date => {
  let lastDate = new Date(startDate);
  
  for (let i = 1; i < count; i++) {
    lastDate = getNextOccurrence(lastDate, frequency, interval);
  }
  
  return lastDate;
};

// Helper to generate sleep events based on schedule
const generateSleepEvents = (
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

// Helper to convert holiday to event
const holidayToEvent = (holiday: Holiday, calendarId: string): Event => {
  const start = new Date(holiday.date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(holiday.date);
  end.setHours(23, 59, 59, 999);
  
  return {
    id: `holiday-${holiday.id}-${calendarId}`,
    calendarId,
    title: holiday.name,
    description: `${holiday.type} holiday`,
    start,
    end,
    allDay: true,
    color: '#f59e0b' // Amber color for holidays
  };
};

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      calendars: [],
      selectedCalendarId: null,
      holidays: HOLIDAYS,
      
      initializeHolidays: () => {
        set({ holidays: HOLIDAYS });
      },
      
      getHolidaysForCalendar: (calendarId, date) => {
        const calendar = get().calendars.find(cal => cal.id === calendarId);
        if (!calendar || !calendar.showHolidays) return [];
        
        return get().holidays.filter(holiday => 
          isSameDay(holiday.date, date)
        );
      },
      
      updateSleepSchedule: (calendarId, sleepSchedule) => {
        // Update the sleep schedule in the calendar
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === calendarId 
              ? { ...calendar, sleepSchedule }
              : calendar
          )
        }));
      },
      
      getSleepEventsForDate: (calendarId, date) => {
        const calendar = get().calendars.find(cal => cal.id === calendarId);
        if (!calendar || !calendar.sleepSchedule?.enabled) return [];
        
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        return generateSleepEvents(calendarId, calendar.sleepSchedule, dayStart, dayEnd);
      },
      
      getSleepEventsForDateRange: (calendarId, startDate, endDate) => {
        const calendar = get().calendars.find(cal => cal.id === calendarId);
        if (!calendar || !calendar.sleepSchedule?.enabled) return [];
        
        return generateSleepEvents(calendarId, calendar.sleepSchedule, startDate, endDate);
      },
      
      addCalendar: (name, description, color, showHolidays = true, sleepSchedule) => {
        const defaultSleepSchedule = { 
          enabled: false, 
          startTime: '22:00', 
          endTime: '06:00' 
        };
        
        const newCalendar: Calendar = {
          id: uuidv4(),
          name,
          description,
          color,
          events: [],
          showHolidays,
          sleepSchedule: sleepSchedule || defaultSleepSchedule
        };
        
        set((state) => ({
          calendars: [...state.calendars, newCalendar],
          selectedCalendarId: newCalendar.id
        }));
        
        return newCalendar;
      },
      
      updateCalendar: (id, data) => {
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === id ? { ...calendar, ...data } : calendar
          )
        }));
      },
      
      deleteCalendar: (id) => {
        set((state) => ({
          calendars: state.calendars.filter((calendar) => calendar.id !== id),
          selectedCalendarId: state.selectedCalendarId === id ? null : state.selectedCalendarId
        }));
      },
      
      selectCalendar: (id) => {
        set(() => ({ selectedCalendarId: id }));
      },
      
      addEvent: (calendarId, eventData) => {
        const newEvent: Event = {
          id: uuidv4(),
          calendarId,
          ...eventData
        };
        
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === calendarId 
              ? { ...calendar, events: [...calendar.events, newEvent] } 
              : calendar
          )
        }));
        
        return newEvent;
      },
      
      updateEvent: (calendarId, eventId, data) => {
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === calendarId 
              ? {
                  ...calendar,
                  events: calendar.events.map((event) => 
                    event.id === eventId ? { ...event, ...data } : event
                  )
                } 
              : calendar
          )
        }));
      },
      
      deleteEvent: (calendarId, eventId) => {
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === calendarId 
              ? {
                  ...calendar,
                  events: calendar.events.filter((event) => {
                    // Remove the base event and all its recurrences
                    if (event.id === eventId) return false;
                    if (event.originalEventId === eventId) return false;
                    return true;
                  })
                } 
              : calendar
          )
        }));
      },
      
      getEventsForDate: (date) => {
        const { calendars } = get();
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        // Get all calendar events
        const allEvents: Event[] = [];
        
        calendars.forEach(calendar => {
          // Get regular events (including recurring)
          const expandedEvents = get().getExpandedEvents(calendar.id, dayStart, dayEnd);
          allEvents.push(...expandedEvents);
          
          // Get sleep events if enabled
          if (calendar.sleepSchedule?.enabled) {
            const sleepEvents = get().getSleepEventsForDate(calendar.id, date);
            allEvents.push(...sleepEvents);
          }
          
          // Add holiday events if enabled
          if (calendar.showHolidays) {
            const holidaysForDate = get().holidays
              .filter(h => isSameDay(h.date, date))
              .map(holiday => holidayToEvent(holiday, calendar.id));
            
            allEvents.push(...holidaysForDate);
          }
        });
        
        // Sort events: all-day first, then by start time
        return allEvents.sort((a, b) => {
          if (a.allDay && !b.allDay) return -1;
          if (!a.allDay && b.allDay) return 1;
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        });
      },
      
      getEventsForDateRange: (startDate, endDate) => {
        const { calendars } = get();
        const allEvents: Event[] = [];
        
        calendars.forEach(calendar => {
          // Get regular events (including recurring)
          const expandedEvents = get().getExpandedEvents(calendar.id, startDate, endDate);
          allEvents.push(...expandedEvents);
          
          // Get sleep events if enabled
          if (calendar.sleepSchedule?.enabled) {
            const sleepEvents = get().getSleepEventsForDateRange(calendar.id, startDate, endDate);
            allEvents.push(...sleepEvents);
          }
          
          // Add holiday events if enabled
          if (calendar.showHolidays) {
            // For each day in the range, check for holidays
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const holidaysForDate = get().holidays
                .filter(h => isSameDay(h.date, currentDate))
                .map(holiday => holidayToEvent(holiday, calendar.id));
              
              allEvents.push(...holidaysForDate);
              currentDate = addDays(currentDate, 1);
            }
          }
        });
        
        // Sort events
        return allEvents.sort((a, b) => {
          if (a.allDay && !b.allDay) return -1;
          if (!a.allDay && b.allDay) return 1;
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        });
      },
      
      // Helper to expand recurring events for a date range
      getExpandedEvents: (calendarId, startDate, endDate) => {
        const calendar = get().calendars.find(cal => cal.id === calendarId);
        if (!calendar) return [];
        
        let expandedEvents: Event[] = [];
        
        // Process each base event
        calendar.events.forEach(event => {
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
                isSameDay(eventEnd, endDate)) {
              expandedEvents.push(event);
            }
          }
        });
        
        return expandedEvents;
      }
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({ 
        calendars: state.calendars,
        selectedCalendarId: state.selectedCalendarId,
        holidays: state.holidays
      }),
    }
  )
);
