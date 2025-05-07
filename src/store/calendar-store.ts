import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calendar, Event, Holiday } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isBefore } from 'date-fns';

import { HOLIDAYS } from './holiday-service';
import { calendarEventService } from './calendar-event-service';
import { eventService } from './event-service';
import { holidayService } from './holiday-service';

interface CalendarState {
  calendars: Calendar[];
  selectedCalendarId: string | null;
  holidays: Holiday[];
  
  // Calendar actions
  addCalendar: (name: string, description: string, color: string, showHolidays?: boolean) => Calendar;
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
  
  // Enhanced recurring event actions
  deleteRecurringEvent: (calendarId: string, eventId: string, mode: 'single' | 'future' | 'all', date?: Date) => void;
  addExceptionDate: (calendarId: string, eventId: string, exceptionDate: Date) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      calendars: [],
      selectedCalendarId: null,
      holidays: HOLIDAYS,
      
      addCalendar: (name, description, color, showHolidays = true) => {
        const newCalendar: Calendar = {
          id: uuidv4(),
          name,
          description,
          color,
          events: [],
          showHolidays
        };
        
        set((state) => ({
          calendars: [...state.calendars, newCalendar],
          selectedCalendarId: newCalendar.id
        }));
        
        return newCalendar;
      },
      
      updateCalendar: (id, data) => {
        console.log(`Updating calendar ${id} with data:`, data);
        
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
        console.log(`Adding event to calendar ${calendarId}:`, eventData);
        
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
        console.log(`Updating event ${eventId} in calendar ${calendarId} with data:`, data);
        
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
        console.log(`Deleting event ${eventId} from calendar ${calendarId}`);
        
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
      
      deleteRecurringEvent: (calendarId, eventId, mode, date) => {
        console.log(`Deleting recurring event ${eventId} from calendar ${calendarId}, mode: ${mode}`);
        
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
