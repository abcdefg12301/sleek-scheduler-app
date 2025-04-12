
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calendar, Event, SleepSchedule, Holiday, RecurrenceRule } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  addDays, isSameDay, startOfDay, endOfDay, 
  isWithinInterval, isBefore, isAfter,
} from 'date-fns';

import { HOLIDAYS, holidayToEvent, getHolidaysForDate } from './holiday-service';
import { generateSleepEvents, getSleepEventsForDate, getSleepEventsForDateRange } from './sleep-service';
import { generateRecurringEvents } from './recurrence-service';

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
  getSleepEventsForCalendar: (calendarId: string, date: Date) => Event[];
}

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
        
        return getHolidaysForDate(get().holidays, date);
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
      
      getSleepEventsForCalendar: (calendarId, date) => {
        const calendar = get().calendars.find(cal => cal.id === calendarId);
        if (!calendar || !calendar.sleepSchedule?.enabled) return [];
        
        return getSleepEventsForDate(calendarId, calendar.sleepSchedule, date);
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
            const sleepEvents = getSleepEventsForDate(calendar.id, calendar.sleepSchedule, date);
            allEvents.push(...sleepEvents);
          }
          
          // Add holiday events if enabled
          if (calendar.showHolidays) {
            const holidaysForDate = getHolidaysForDate(get().holidays, date)
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
            const sleepEvents = getSleepEventsForDateRange(calendar.id, calendar.sleepSchedule, startDate, endDate);
            allEvents.push(...sleepEvents);
          }
          
          // Add holiday events if enabled
          if (calendar.showHolidays) {
            // For each day in the range, check for holidays
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const holidaysForDate = getHolidaysForDate(get().holidays, currentDate)
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
