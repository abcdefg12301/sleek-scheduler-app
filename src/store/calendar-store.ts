
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calendar, Event, Holiday } from '../types';

import { HOLIDAYS } from './holiday-service';
import { calendarEventService } from './calendar-event-service';
import { createCalendarActions, CalendarActions } from './calendar-actions';
import { createEventActions, EventActions } from './event-actions';

interface CalendarState extends CalendarActions, EventActions {
  calendars: Calendar[];
  selectedCalendarId: string | null;
  holidays: Holiday[];
  isInitialized: boolean;
  
  // Query methods
  getEventsForDate: (date: Date) => Event[];
  getEventsForDateRange: (startDate: Date, endDate: Date) => Event[];
  getExpandedEvents: (calendarId: string, startDate: Date, endDate: Date) => Event[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      // State
      calendars: [],
      selectedCalendarId: null,
      holidays: HOLIDAYS,
      isInitialized: false,

      // Actions
      ...createCalendarActions(set, get),
      ...createEventActions(set, get),
      
      // Query methods
      getEventsForDate: (date) => {
        const { calendars } = get();
        console.time('getEventsForDate');
        const events = calendarEventService.getEventsForDate(calendars, date, HOLIDAYS);
        console.timeEnd('getEventsForDate');
        return events;
      },
      
      getEventsForDateRange: (startDate, endDate) => {
        const { calendars } = get();
        console.time('getEventsForDateRange');
        const events = calendarEventService.getEventsForDateRange(calendars, startDate, endDate, HOLIDAYS);
        console.timeEnd('getEventsForDateRange');
        return events;
      },
      
      getExpandedEvents: (calendarId, startDate, endDate) => {
        const calendar = get().calendars.find(cal => cal.id === calendarId);
        if (!calendar) return [];
        
        // Import here to avoid circular dependency
        const { eventService } = require('./event-service');
        return eventService.getExpandedEvents(calendar.events, startDate, endDate);
      }
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({ 
        selectedCalendarId: state.selectedCalendarId,
        // Don't persist calendars and holidays as they're user-specific
      }),
    }
  )
);
