import { create } from 'zustand';
import { Calendar, Event } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { initialCalendars } from '@/data/calendars';

interface CalendarStore {
  calendars: Calendar[];
  selectedCalendarId: string | null;
  selectCalendar: (calendarId: string) => void;
  addCalendar: (calendar: Omit<Calendar, 'id'>) => string;
  updateCalendar: (calendarId: string, updates: Partial<Calendar>) => void;
  deleteCalendar: (calendarId: string) => void;
  addEvent: (event: Omit<Event, 'id'>) => string;
  updateEvent: (calendarId: string, eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (calendarId: string, eventId: string) => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  calendars: initialCalendars,
  selectedCalendarId: null,
  selectCalendar: (calendarId: string) => set({ selectedCalendarId: calendarId }),
  addCalendar: (calendar: Omit<Calendar, 'id'>) => {
    const newCalendar: Calendar = {
      ...calendar,
      id: uuidv4(),
      events: [],
    };
    set((state) => ({
      calendars: [...state.calendars, newCalendar],
      selectedCalendarId: newCalendar.id,
    }));
    return newCalendar.id;
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
  addEvent: (event: Omit<Event, 'id'>) => {
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
}));
