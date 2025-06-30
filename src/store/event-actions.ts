
import { Event } from '../types';
import { supabaseService } from "@/services/supabase-service";

export interface EventActions {
  addEvent: (calendarId: string, event: Omit<Event, 'id' | 'calendarId'>) => Promise<Event>;
  updateEvent: (calendarId: string, eventId: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (calendarId: string, eventId: string) => Promise<void>;
  deleteRecurringEvent: (calendarId: string, eventId: string, mode: 'single' | 'future' | 'all', date?: Date) => Promise<void>;
  addExceptionDate: (calendarId: string, eventId: string, exceptionDate: Date) => void;
}

export const createEventActions = (set: any, get: any): EventActions => ({
  async addEvent(calendarId, eventData) {
    try {
      console.log('Creating event:', { calendarId, title: eventData.title });
      const calendar = get().calendars.find((cal: any) => cal.id === calendarId);
      if (!calendar) {
        await get().syncCalendarsFromSupabase();
        const refreshedCalendar = get().calendars.find((cal: any) => cal.id === calendarId);
        if (!refreshedCalendar) {
          throw new Error(`Calendar with ID ${calendarId} not found`);
        }
      }

      const event = await supabaseService.createEvent({
        ...eventData,
        calendarId,
      });
      if (event) {
        set((state: any) => ({
          calendars: state.calendars.map((cal: any) =>
            cal.id === calendarId
              ? { ...cal, events: [...cal.events, event] }
              : cal
          ),
        }));
        console.log('Event created successfully:', event.id);
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
      console.log('Updating event:', { calendarId, eventId });
      const updatedEvent = await supabaseService.updateEvent(eventId, data);
      if (updatedEvent) {
        set((state: any) => ({
          calendars: state.calendars.map((cal: any) =>
            cal.id === calendarId
              ? {
                  ...cal,
                  events: cal.events.map((ev: any) =>
                    ev.id === eventId ? { ...ev, ...updatedEvent } : ev
                  ),
                }
              : cal
          ),
        }));
        console.log('Event updated successfully:', eventId);
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  },

  async deleteEvent(calendarId, eventId) {
    try {
      console.log('Deleting event:', { calendarId, eventId });
      await supabaseService.deleteEvent(eventId);
      set((state: any) => ({
        calendars: state.calendars.map((cal: any) =>
          cal.id === calendarId
            ? {
                ...cal,
                events: cal.events.filter(
                  (ev: any) => ev.id !== eventId && ev.originalEventId !== eventId
                ),
              }
            : cal
        ),
      }));
      console.log('Event deleted successfully:', eventId);
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  },

  async deleteRecurringEvent(calendarId, eventId, mode, date) {
    console.log(`Deleting recurring event ${eventId} from calendar ${calendarId}, mode: ${mode}`);
    
    try {
      await supabaseService.deleteEvent(eventId);
      
      set((state: any) => {
        const calendar = state.calendars.find((cal: any) => cal.id === calendarId);
        if (!calendar) return state;
        
        const originalEvent = calendar.events.find((event: any) => event.id === eventId);
        if (!originalEvent) return state;
        
        const masterId = originalEvent.originalEventId || originalEvent.id;
        const masterEvent = calendar.events.find((event: any) => event.id === masterId);
        
        if (!masterEvent || !masterEvent.recurrence) {
          return {
            ...state,
            calendars: state.calendars.map((cal: any) => 
              cal.id === calendarId 
                ? {
                    ...cal,
                    events: cal.events.filter((event: any) => event.id !== eventId && event.originalEventId !== eventId)
                  }
                : cal
            )
          };
        }
        
        switch (mode) {
          case 'single': {
            if (!date) return state;
            
            const updatedEvents = calendar.events.map((event: any) => {
              if (event.id === masterId) {
                return {
                  ...event,
                  exceptionDates: [
                    ...(event.exceptionDates || []),
                    date.toISOString().split('T')[0]
                  ]
                };
              }
              return event;
            });
            
            return {
              ...state,
              calendars: state.calendars.map((cal: any) => 
                cal.id === calendarId ? { ...cal, events: updatedEvents } : cal
              )
            };
          }
            
          case 'future': {
            if (!date) return state;
            
            const updatedEvents = calendar.events.map((event: any) => {
              if (event.id === masterId && event.recurrence) {
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
              calendars: state.calendars.map((cal: any) => 
                cal.id === calendarId ? { ...cal, events: updatedEvents } : cal
              )
            };
          }
            
          case 'all': {
            return {
              ...state,
              calendars: state.calendars.map((cal: any) => 
                cal.id === calendarId 
                  ? {
                      ...cal,
                      events: cal.events.filter((event: any) => 
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
  
  addExceptionDate(calendarId, eventId, exceptionDate) {
    console.log('Adding exception date:', { calendarId, eventId, exceptionDate });
    set((state: any) => {
      const calendar = state.calendars.find((cal: any) => cal.id === calendarId);
      if (!calendar) return state;
      
      const event = calendar.events.find((e: any) => e.id === eventId);
      if (!event) return state;
      
      const dateString = exceptionDate.toISOString().split('T')[0];
      
      const updatedEvents = calendar.events.map((e: any) => {
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
        calendars: state.calendars.map((cal: any) => 
          cal.id === calendarId ? { ...cal, events: updatedEvents } : cal
        )
      };
    });
  }
});
