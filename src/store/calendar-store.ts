
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calendar, Event, SleepSchedule, Holiday, RecurrenceRule } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  addDays, addWeeks, addMonths, addYears, 
  format, isSameDay, startOfDay, endOfDay, 
  isWithinInterval, isBefore, isAfter, 
  differenceInDays, getYear, getMonth, getDate 
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
  
  const events: Event[] = [];
  const { frequency, interval = 1, count, endDate: recurrenceEndDate } = event.recurrence;
  
  let currentDate = new Date(event.start);
  const originalStart = new Date(event.start);
  const originalEnd = new Date(event.end);
  const duration = differenceInDays(originalEnd, originalStart);

  // Determine the actual end date for the recurrence
  let maxDate = recurrenceEndDate ? new Date(recurrenceEndDate) : endDate;
  if (count) {
    const lastDate = getLastRecurrenceDate(originalStart, frequency, interval, count);
    if (isBefore(lastDate, maxDate)) {
      maxDate = lastDate;
    }
  }

  // Loop and generate recurring events
  let recurrenceCount = 0;
  while (isBefore(currentDate, maxDate) && (!count || recurrenceCount < count)) {
    // Add the event if it's within the requested range
    if (isAfter(currentDate, startDate) || isSameDay(currentDate, startDate)) {
      const eventEnd = addDays(currentDate, duration);
      
      // Create a new instance of the recurring event
      const newEvent: Event = {
        ...event,
        id: `${event.id}-recurrence-${recurrenceCount}`,
        start: new Date(currentDate),
        end: new Date(eventEnd),
        isRecurrenceInstance: true,
        originalEventId: event.id
      };
      
      events.push(newEvent);
    }
    
    // Move to next occurrence based on frequency
    switch (frequency) {
      case 'daily':
        currentDate = addDays(currentDate, interval);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, interval);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, interval);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, interval);
        break;
    }
    
    recurrenceCount++;
  }
  
  // Also include the original event if it's within range
  if (isWithinInterval(originalStart, { start: startDate, end: maxDate }) || 
      isSameDay(originalStart, startDate)) {
    events.unshift(event);
  }
  
  return events;
};

// Helper to calculate the last date in a recurrence pattern
const getLastRecurrenceDate = (startDate: Date, frequency: string, interval = 1, count: number): Date => {
  let lastDate = new Date(startDate);
  
  for (let i = 1; i < count; i++) {
    switch (frequency) {
      case 'daily':
        lastDate = addDays(lastDate, interval);
        break;
      case 'weekly':
        lastDate = addWeeks(lastDate, interval);
        break;
      case 'monthly':
        lastDate = addMonths(lastDate, interval);
        break;
      case 'yearly':
        lastDate = addYears(lastDate, interval);
        break;
    }
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
  if (!sleepSchedule.enabled) return [];
  
  const events: Event[] = [];
  const [sleepHour, sleepMinute] = sleepSchedule.startTime.split(':').map(Number);
  const [wakeHour, wakeMinute] = sleepSchedule.endTime.split(':').map(Number);
  
  // Generate sleep events for each day in the date range
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0); // Start from beginning of day
  
  const rangeEndDate = new Date(endDate);
  
  while (currentDate <= rangeEndDate) {
    const sleepStart = new Date(currentDate);
    sleepStart.setHours(sleepHour, sleepMinute, 0, 0);
    
    let sleepEnd = new Date(currentDate);
    // If end time is earlier than start time, it means sleep ends next day
    if (wakeHour < sleepHour || (wakeHour === sleepHour && wakeMinute <= sleepMinute)) {
      sleepEnd = addDays(sleepEnd, 1);
    }
    sleepEnd.setHours(wakeHour, wakeMinute, 0, 0);
    
    // Create sleep event for this day
    const sleepEvent: Event = {
      id: `sleep-${calendarId}-${format(currentDate, 'yyyy-MM-dd')}`,
      calendarId,
      title: 'Sleep',
      description: 'Sleep time',
      start: sleepStart,
      end: sleepEnd,
      allDay: false,
      color: '#3730a3'
    };
    
    events.push(sleepEvent);
    
    // Move to next day
    currentDate = addDays(currentDate, 1);
  }
  
  return events;
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
                  events: calendar.events.filter((event) => event.id !== eventId)
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
              .map(holiday => ({
                id: `holiday-${holiday.id}-${calendar.id}`,
                calendarId: calendar.id,
                title: holiday.name,
                start: new Date(date),
                end: new Date(date),
                allDay: true,
                color: '#f59e0b'
              }));
            
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
