import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calendar, Event, SleepSchedule, Holiday } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';

import { HOLIDAYS } from './holiday-service';
import { calendarEventService } from './calendar-event-service';
import { eventService } from './event-service';
import { sleepService } from './sleep-service';
import { holidayService } from './holiday-service';

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
  
  // Sleep schedule
  updateSleepSchedule: (calendarId: string, sleepSchedule: SleepSchedule) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      calendars: [],
      selectedCalendarId: null,
      holidays: HOLIDAYS,
      
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
        const newEvent = eventService.createEvent(calendarId, eventData);
        
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
        return calendarEventService.getEventsForDate(calendars, date, HOLIDAYS);
      },
      
      getEventsForDateRange: (startDate, endDate) => {
        const { calendars } = get();
        return calendarEventService.getEventsForDateRange(calendars, startDate, endDate, HOLIDAYS);
      },
      
      getExpandedEvents: (calendarId, startDate, endDate) => {
        const calendar = get().calendars.find(cal => cal.id === calendarId);
        if (!calendar) return [];
        
        return eventService.getExpandedEvents(calendar.events, startDate, endDate);
      },
      
      updateSleepSchedule: (calendarId, sleepSchedule) => {
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === calendarId 
              ? { ...calendar, sleepSchedule }
              : calendar
          )
        }));
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
