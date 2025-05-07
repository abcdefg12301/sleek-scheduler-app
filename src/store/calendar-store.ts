
import { create } from 'zustand';
import { Calendar, Event } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { initialCalendars } from '@/data/calendars';
import { calendarEventService } from './calendar-event-service';
import { HOLIDAYS } from './holiday-service';

interface CalendarStore {
  calendars: Calendar[];
  selectedCalendarId: string | null;
  selectCalendar: (calendarId: string) => void;
  addCalendar: (name: string, description: string, color: string, showHolidays: boolean) => { id: string };
  updateCalendar: (calendarId: string, updates: Partial<Calendar>) => void;
  deleteCalendar: (calendarId: string) => void;
  addEvent: (event: Omit<Event, 'id'> & { calendarId: string }) => string;
  updateEvent: (calendarId: string, eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (calendarId: string, eventId: string) => void;
  deleteRecurringEvent: (calendarId: string, eventId: string, deleteAll: boolean) => void;
  getEventsForDateRange: (startDate: Date, endDate: Date) => Event[];
  getEventsForDate: (date: Date) => Event[];
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  calendars: initialCalendars,
  selectedCalendarId: null,
  selectCalendar: (calendarId: string) => set({ selectedCalendarId: calendarId }),
  addCalendar: (name: string, description: string, color: string, showHolidays: boolean) => {
    const newCalendar: Calendar = {
      id: uuidv4(),
      name,
      description,
      color,
      showHolidays,
      events: [],
    };
    
    set((state) => ({
      calendars: [...state.calendars, newCalendar],
      selectedCalendarId: newCalendar.id,
    }));
    
    return { id: newCalendar.id };
  },
  updateCalendar: (calendarId: string, updates: Partial<Calendar>) => {
    set((state) => ({
      calendars: state.calendars.map((calendar) =>
        calendar.id === calendarId ? { ...calendar, ...updates } : calendar
      ),
    }));
  },
  deleteCalendar: (calendarId: string) => {
    set((state) => ({
      calendars: state.calendars.filter((calendar) => calendar.id !== calendarId),
      selectedCalendarId: state.selectedCalendarId === calendarId ? null : state.selectedCalendarId,
    }));
  },
  addEvent: (event: Omit<Event, 'id'> & { calendarId: string }) => {
    const newEvent: Event = {
      ...event,
      id: uuidv4(),
    };
    
    set((state) => ({
      calendars: state.calendars.map((calendar) =>
        calendar.id === newEvent.calendarId
          ? { ...calendar, events: [...calendar.events, newEvent] }
          : calendar
      ),
    }));
    
    return newEvent.id;
  },
  updateEvent: (calendarId: string, eventId: string, updates: Partial<Event>) => {
    set((state) => ({
      calendars: state.calendars.map((calendar) =>
        calendar.id === calendarId
          ? {
              ...calendar,
              events: calendar.events.map((event) =>
                event.id === eventId ? { ...event, ...updates } : event
              ),
            }
          : calendar
      ),
    }));
  },
  deleteEvent: (calendarId: string, eventId: string) => {
    set((state) => ({
      calendars: state.calendars.map((calendar) =>
        calendar.id === calendarId
          ? {
              ...calendar,
              events: calendar.events.filter((event) => event.id !== eventId),
            }
          : calendar
      ),
    }));
  },
  deleteRecurringEvent: (calendarId: string, eventId: string, deleteAll: boolean) => {
    if (deleteAll) {
      // If deleteAll is true, find the original event ID and delete all instances
      const state = get();
      const calendar = state.calendars.find(cal => cal.id === calendarId);
      if (!calendar) return;
      
      const event = calendar.events.find(evt => evt.id === eventId);
      if (!event) return;
      
      // If this is a recurrence instance, get the original event ID
      const originalId = event.originalEventId || event.id;
      
      // Delete the original event and all its instances
      set((state) => ({
        calendars: state.calendars.map((calendar) =>
          calendar.id === calendarId
            ? {
                ...calendar,
                events: calendar.events.filter((evt) => 
                  evt.id !== originalId && evt.originalEventId !== originalId
                ),
              }
            : calendar
        ),
      }));
    } else {
      // Just delete this specific instance
      // For recurrence instances, mark the date as an exception
      const state = get();
      const calendar = state.calendars.find(cal => cal.id === calendarId);
      if (!calendar) return;
      
      const event = calendar.events.find(evt => evt.id === eventId);
      if (!event) return;
      
      if (event.isRecurrenceInstance && event.originalEventId) {
        // Find the original event
        const originalEvent = calendar.events.find(evt => evt.id === event.originalEventId);
        if (originalEvent) {
          // Add this date to the exception dates
          const eventDate = new Date(event.start);
          const dateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
          
          const exceptionDates = originalEvent.exceptionDates || [];
          if (!exceptionDates.includes(dateStr)) {
            get().updateEvent(calendarId, originalEvent.id, {
              exceptionDates: [...exceptionDates, dateStr]
            });
          }
        }
      }
      
      // Delete the event instance
      get().deleteEvent(calendarId, eventId);
    }
  },
  getEventsForDateRange: (startDate: Date, endDate: Date) => {
    const state = get();
    return calendarEventService.getEventsForDateRange(state.calendars, startDate, endDate, HOLIDAYS);
  },
  getEventsForDate: (date: Date) => {
    const state = get();
    return calendarEventService.getEventsForDate(state.calendars, date, HOLIDAYS);
  }
}));
