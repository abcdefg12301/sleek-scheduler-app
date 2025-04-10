
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calendar, Event } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface CalendarState {
  calendars: Calendar[];
  selectedCalendarId: string | null;
  
  // Calendar actions
  addCalendar: (name: string, description: string, color: string) => Calendar;
  updateCalendar: (id: string, data: Partial<Calendar>) => void;
  deleteCalendar: (id: string) => void;
  selectCalendar: (id: string | null) => void;
  
  // Event actions
  addEvent: (calendarId: string, event: Omit<Event, 'id' | 'calendarId'>) => Event;
  updateEvent: (calendarId: string, eventId: string, data: Partial<Event>) => void;
  deleteEvent: (calendarId: string, eventId: string) => void;
  getEventsForDate: (date: Date) => Event[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      calendars: [],
      selectedCalendarId: null,
      
      addCalendar: (name, description, color) => {
        const newCalendar: Calendar = {
          id: uuidv4(),
          name,
          description,
          color,
          events: []
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
        const dateStr = date.toISOString().split('T')[0];
        
        return calendars.flatMap((calendar) => 
          calendar.events.filter((event) => {
            const eventStartDate = new Date(event.start).toISOString().split('T')[0];
            const eventEndDate = new Date(event.end).toISOString().split('T')[0];
            
            return eventStartDate <= dateStr && eventEndDate >= dateStr;
          })
        );
      }
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({ 
        calendars: state.calendars,
        selectedCalendarId: state.selectedCalendarId
      }),
    }
  )
);
