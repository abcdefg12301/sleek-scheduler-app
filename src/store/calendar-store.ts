
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calendar, Event, Holiday } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isBefore } from 'date-fns';

import { HOLIDAYS } from './holiday-service';
import { calendarEventService } from './calendar-event-service';
import { eventService } from './event-service';
import { holidayService } from './holiday-service';

// Split store logic into smaller service functions:
import { supabaseService } from "@/services/supabase-service";

interface CalendarState {
  calendars: Calendar[];
  selectedCalendarId: string | null;
  holidays: Holiday[];
  
  // Calendar actions
  addCalendar: (name: string, description: string, color: string, showHolidays?: boolean) => Promise<Calendar>;
  updateCalendar: (id: string, data: Partial<Calendar>) => Promise<void>;
  deleteCalendar: (id: string) => Promise<void>;
  selectCalendar: (id: string | null) => void;
  
  // Event actions
  addEvent: (calendarId: string, event: Omit<Event, 'id' | 'calendarId'>) => Promise<Event>;
  updateEvent: (calendarId: string, eventId: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (calendarId: string, eventId: string) => Promise<void>;
  getEventsForDate: (date: Date) => Event[];
  getEventsForDateRange: (startDate: Date, endDate: Date) => Event[];
  getExpandedEvents: (calendarId: string, startDate: Date, endDate: Date) => Event[];
  
  // Enhanced recurring event actions
  deleteRecurringEvent: (calendarId: string, eventId: string, mode: 'single' | 'future' | 'all', date?: Date) => Promise<void>;
  addExceptionDate: (calendarId: string, eventId: string, exceptionDate: Date) => void;

  // --- Backend (Supabase) synchronization ---
  syncCalendarsFromSupabase: () => Promise<void>;
}

// Slices for modularity:
export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      // --- Local state ---
      calendars: [],
      selectedCalendarId: null,
      holidays: HOLIDAYS,

      // --- Backend (Supabase) synchronization ---
      async syncCalendarsFromSupabase() {
        try {
          const calendars = await supabaseService.fetchCalendars();
          set({ calendars });
        } catch (error) {
          console.error('Failed to sync calendars:', error);
          throw error;
        }
      },

      async addCalendar(name, description, color, showHolidays = true) {
        try {
          const calendar = await supabaseService.createCalendar({
            name,
            description,
            color,
            showHolidays,
          });
          if (calendar) {
            set((state) => ({
              calendars: [...state.calendars, calendar],
              selectedCalendarId: calendar.id,
            }));
            return calendar;
          }
          throw new Error("Failed to add calendar");
        } catch (error) {
          console.error('Failed to add calendar:', error);
          throw error;
        }
      },

      async updateCalendar(id, data) {
        try {
          const updatedCalendar = await supabaseService.updateCalendar(id, data);
          if (updatedCalendar) {
            set((state) => ({
              calendars: state.calendars.map((cal) =>
                cal.id === id ? { ...cal, ...updatedCalendar } : cal
              ),
            }));
          }
        } catch (error) {
          console.error('Failed to update calendar:', error);
          throw error;
        }
      },

      async deleteCalendar(id) {
        try {
          await supabaseService.deleteCalendar(id);
          set((state) => ({
            calendars: state.calendars.filter((cal) => cal.id !== id),
            selectedCalendarId:
              state.selectedCalendarId === id ? null : state.selectedCalendarId,
          }));
        } catch (error) {
          console.error('Failed to delete calendar:', error);
          throw error;
        }
      },

      selectCalendar: (id) => set(() => ({ selectedCalendarId: id })),

      // --- Events ---
      async addEvent(calendarId, eventData) {
        try {
          const event = await supabaseService.createEvent({
            ...eventData,
            calendarId,
          });
          if (event) {
            set((state) => ({
              calendars: state.calendars.map((cal) =>
                cal.id === calendarId
                  ? { ...cal, events: [...cal.events, event] }
                  : cal
              ),
            }));
            return event;
          }
          throw new Error("Failed to add event");
        } catch (error) {
          console.error('Failed to add event:', error);
          throw error;
        }
      },

      async updateEvent(calendarId, eventId, data) {
        try {
          const updatedEvent = await supabaseService.updateEvent(eventId, data);
          if (updatedEvent) {
            set((state) => ({
              calendars: state.calendars.map((cal) =>
                cal.id === calendarId
                  ? {
                      ...cal,
                      events: cal.events.map((ev) =>
                        ev.id === eventId ? { ...ev, ...updatedEvent } : ev
                      ),
                    }
                  : cal
              ),
            }));
          }
        } catch (error) {
          console.error('Failed to update event:', error);
          throw error;
        }
      },

      async deleteEvent(calendarId, eventId) {
        try {
          await supabaseService.deleteEvent(eventId);
          set((state) => ({
            calendars: state.calendars.map((cal) =>
              cal.id === calendarId
                ? {
                    ...cal,
                    events: cal.events.filter(
                      (ev) => ev.id !== eventId && ev.originalEventId !== eventId
                    ),
                  }
                : cal
            ),
          }));
        } catch (error) {
          console.error('Failed to delete event:', error);
          throw error;
        }
      },
      
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
        
        return eventService.getExpandedEvents(calendar.events, startDate, endDate);
      },
      
      deleteRecurringEvent: async (calendarId, eventId, mode, date) => {
        console.log(`Deleting recurring event ${eventId} from calendar ${calendarId}, mode: ${mode}`);
        
        try {
          // Handle deletion via supabase service
          await supabaseService.deleteEvent(eventId);
          
          set((state) => {
            const calendar = state.calendars.find(cal => cal.id === calendarId);
            if (!calendar) return state;
            
            // Find the original event
            const originalEvent = calendar.events.find(event => event.id === eventId);
            if (!originalEvent) return state;
            
            // If it's an instance, we need to find the master event
            const masterId = originalEvent.originalEventId || originalEvent.id;
            const masterEvent = calendar.events.find(event => event.id === masterId);
            
            if (!masterEvent || !masterEvent.recurrence) {
              // If not a recurring event, just delete normally
              return {
                ...state,
                calendars: state.calendars.map(cal => 
                  cal.id === calendarId 
                    ? {
                        ...cal,
                        events: cal.events.filter(event => event.id !== eventId && event.originalEventId !== eventId)
                      }
                    : cal
                )
              };
            }
            
            switch (mode) {
              case 'single': {
                if (!date) return state;
                
                // For single deletion, we add an exception date to the master event
                const updatedEvents = calendar.events.map(event => {
                  if (event.id === masterId) {
                    // Add the exception date
                    return {
                      ...event,
                      exceptionDates: [
                        ...(event.exceptionDates || []),
                        date.toISOString().split('T')[0] // Store as YYYY-MM-DD
                      ]
                    };
                  }
                  return event;
                });
                
                return {
                  ...state,
                  calendars: state.calendars.map(cal => 
                    cal.id === calendarId ? { ...cal, events: updatedEvents } : cal
                  )
                };
              }
                
              case 'future': {
                if (!date) return state;
                
                // For future deletion, we update the end date of the recurrence
                const updatedEvents = calendar.events.map(event => {
                  if (event.id === masterId && event.recurrence) {
                    // Set the end date to the day before the selected date
                    const endDate = new Date(date);
                    endDate.setDate(endDate.getDate() - 1);
                    
                    return {
                      ...event,
                      recurrence: {
                        ...event.recurrence,
                        endDate: endDate
                      }
                    };
                  }
                  return event;
                });
                
                return {
                  ...state,
                  calendars: state.calendars.map(cal => 
                    cal.id === calendarId ? { ...cal, events: updatedEvents } : cal
                  )
                };
              }
                
              case 'all': {
                // For all deletion, we remove the original event and all instances
                return {
                  ...state,
                  calendars: state.calendars.map(cal => 
                    cal.id === calendarId 
                      ? {
                          ...cal,
                          events: cal.events.filter(event => 
                            event.id !== masterId && event.originalEventId !== masterId
                          )
                        }
                      : cal
                  )
                };
              }
                
              default:
                return state;
            }
          });
        } catch (error) {
          console.error('Failed to delete recurring event:', error);
          throw error;
        }
      },
      
      addExceptionDate: (calendarId, eventId, exceptionDate) => {
        set((state) => {
          const calendar = state.calendars.find(cal => cal.id === calendarId);
          if (!calendar) return state;
          
          const event = calendar.events.find(e => e.id === eventId);
          if (!event) return state;
          
          const dateString = exceptionDate.toISOString().split('T')[0];
          
          const updatedEvents = calendar.events.map(e => {
            if (e.id === eventId) {
              return {
                ...e,
                exceptionDates: [
                  ...(e.exceptionDates || []),
                  dateString
                ]
              };
            }
            return e;
          });
          
          return {
            ...state,
            calendars: state.calendars.map(cal => 
              cal.id === calendarId ? { ...cal, events: updatedEvents } : cal
            )
          };
        });
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
