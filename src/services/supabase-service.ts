import { supabase } from '@/integrations/supabase/client';
import { Calendar, Event, RecurrenceRule } from '@/types';
import { toast } from 'sonner';

// Type mappings for database to application models
interface DbCalendar {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  show_holidays: boolean;
  created_at: string;
  updated_at: string;
}

interface DbEvent {
  id: string;
  calendar_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string | null;
  is_holiday: boolean;
  is_segment: boolean;
  segment_type: string | null;
  is_recurrence_instance: boolean;
  original_event_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DbRecurrence {
  id: string;
  event_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date: string | null;
  count: number | null;
  created_at: string;
  updated_at: string;
}

// Conversion helpers
const toAppCalendar = (dbCalendar: DbCalendar): Calendar => {
  return {
    id: dbCalendar.id,
    name: dbCalendar.name,
    description: dbCalendar.description || '',
    color: dbCalendar.color || '#4285f4',
    showHolidays: dbCalendar.show_holidays,
    events: []
  };
};

const toAppEvent = (dbEvent: DbEvent, recurrence?: DbRecurrence): Event => {
  let appRecurrence: RecurrenceRule | undefined;
  
  if (recurrence) {
    appRecurrence = {
      frequency: recurrence.frequency,
      interval: recurrence.interval,
      endDate: recurrence.end_date ? new Date(recurrence.end_date) : undefined,
      count: recurrence.count || undefined
    };
  }
  
  return {
    id: dbEvent.id,
    calendarId: dbEvent.calendar_id,
    title: dbEvent.title,
    description: dbEvent.description || undefined,
    location: dbEvent.location || undefined,
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    allDay: dbEvent.all_day,
    color: dbEvent.color || undefined,
    isHoliday: dbEvent.is_holiday,
    isSegment: dbEvent.is_segment,
    segmentType: dbEvent.segment_type as 'start' | 'middle' | 'end' | undefined,
    isRecurrenceInstance: dbEvent.is_recurrence_instance,
    originalEventId: dbEvent.original_event_id || undefined,
    recurrence: appRecurrence
  };
};

const toDbCalendar = (appCalendar: Calendar): Omit<DbCalendar, 'id' | 'created_at' | 'updated_at'> => {
  return {
    name: appCalendar.name,
    description: appCalendar.description,
    color: appCalendar.color,
    show_holidays: appCalendar.showHolidays
  };
};

const toDbEvent = (appEvent: Event): Omit<DbEvent, 'id' | 'created_at' | 'updated_at'> => {
  return {
    calendar_id: appEvent.calendarId,
    title: appEvent.title,
    description: appEvent.description || null,
    location: appEvent.location || null,
    start_time: appEvent.start.toISOString(),
    end_time: appEvent.end.toISOString(),
    all_day: appEvent.allDay,
    color: appEvent.color || null,
    is_holiday: !!appEvent.isHoliday,
    is_segment: !!appEvent.isSegment,
    segment_type: appEvent.segmentType || null,
    is_recurrence_instance: !!appEvent.isRecurrenceInstance,
    original_event_id: appEvent.originalEventId || null
  };
};

const toDbRecurrence = (eventId: string, recurrence: RecurrenceRule): Omit<DbRecurrence, 'id' | 'created_at' | 'updated_at'> => {
  return {
    event_id: eventId,
    frequency: recurrence.frequency,
    interval: recurrence.interval,
    end_date: recurrence.endDate ? recurrence.endDate.toISOString() : null,
    count: recurrence.count || null
  };
};

// Supabase service
export const supabaseService = {
  // Calendar methods
  async fetchCalendars(): Promise<Calendar[]> {
    try {
      const { data, error } = await supabase
        .from('calendars')
        .select('*');
        
      if (error) throw error;
      
      // Convert database records to application models
      const calendars = data.map(toAppCalendar);
      
      // Fetch events for each calendar
      for (const calendar of calendars) {
        const events = await this.fetchEventsForCalendar(calendar.id);
        calendar.events = events;
      }
      
      return calendars;
    } catch (error) {
      console.error('Error fetching calendars:', error);
      toast.error('Failed to load calendars');
      return [];
    }
  },
  
  async createCalendar(calendar: Omit<Calendar, 'id' | 'events'>): Promise<Calendar | null> {
    try {
      const dbCalendar = toDbCalendar({ ...calendar, id: '', events: [] });
      
      const { data, error } = await supabase
        .from('calendars')
        .insert(dbCalendar)
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...toAppCalendar(data), events: [] };
    } catch (error) {
      console.error('Error creating calendar:', error);
      toast.error('Failed to create calendar');
      return null;
    }
  },
  
  async updateCalendar(id: string, calendar: Partial<Calendar>): Promise<Calendar | null> {
    try {
      // Only update fields that are in the database schema
      const dbCalendarUpdate = {
        ...(calendar.name !== undefined && { name: calendar.name }),
        ...(calendar.description !== undefined && { description: calendar.description }),
        ...(calendar.color !== undefined && { color: calendar.color }),
        ...(calendar.showHolidays !== undefined && { show_holidays: calendar.showHolidays })
      };
      
      const { data, error } = await supabase
        .from('calendars')
        .update(dbCalendarUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { ...toAppCalendar(data), events: [] };
    } catch (error) {
      console.error('Error updating calendar:', error);
      toast.error('Failed to update calendar');
      return null;
    }
  },
  
  async deleteCalendar(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('calendars')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting calendar:', error);
      toast.error('Failed to delete calendar');
      return false;
    }
  },
  
  // Event methods
  async fetchEventsForCalendar(calendarId: string): Promise<Event[]> {
    try {
      // Fetch events
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('calendar_id', calendarId);
      
      if (eventError) throw eventError;
      
      // Fetch recurrence rules
      const eventIds = eventData.map(e => e.id);
      const { data: recurrenceData, error: recurrenceError } = await supabase
        .from('recurrences')
        .select('*')
        .in('event_id', eventIds);
      
      if (recurrenceError && eventIds.length > 0) throw recurrenceError;
      
      // Map recurrence rules to events
      const recurrenceMap = new Map<string, DbRecurrence>();
      if (recurrenceData) {
        recurrenceData.forEach(r => recurrenceMap.set(r.event_id, r));
      }
      
      // Convert DB events to app events
      return eventData.map(dbEvent => {
        const recurrence = recurrenceMap.get(dbEvent.id);
        return toAppEvent(dbEvent, recurrence);
      });
    } catch (error) {
      console.error('Error fetching events for calendar:', error);
      toast.error('Failed to load events');
      return [];
    }
  },
  
  async createEvent(event: Omit<Event, 'id'>): Promise<Event | null> {
    try {
      const dbEvent = toDbEvent({ ...event, id: '' });
      
      // Insert event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert(dbEvent)
        .select()
        .single();
      
      if (eventError) throw eventError;
      
      let recurrenceData = null;
      
      // Insert recurrence rule if present
      if (event.recurrence) {
        const dbRecurrence = toDbRecurrence(eventData.id, event.recurrence);
        
        const { data, error } = await supabase
          .from('recurrences')
          .insert(dbRecurrence)
          .select()
          .single();
        
        if (error) throw error;
        recurrenceData = data;
      }
      
      return toAppEvent(eventData, recurrenceData);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      return null;
    }
  },
  
  async updateEvent(id: string, event: Partial<Event>): Promise<Event | null> {
    try {
      // Only update fields that are in the database schema
      const dbEventUpdate: any = {};
      
      if (event.title !== undefined) dbEventUpdate.title = event.title;
      if (event.description !== undefined) dbEventUpdate.description = event.description;
      if (event.location !== undefined) dbEventUpdate.location = event.location;
      if (event.start !== undefined) dbEventUpdate.start_time = event.start.toISOString();
      if (event.end !== undefined) dbEventUpdate.end_time = event.end.toISOString();
      if (event.allDay !== undefined) dbEventUpdate.all_day = event.allDay;
      if (event.color !== undefined) dbEventUpdate.color = event.color;
      
      // Update event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .update(dbEventUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (eventError) throw eventError;
      
      // Handle recurrence rule
      if (event.recurrence !== undefined) {
        // Delete existing recurrence rule
        await supabase
          .from('recurrences')
          .delete()
          .eq('event_id', id);
        
        // Create new recurrence rule if present
        if (event.recurrence) {
          const dbRecurrence = toDbRecurrence(id, event.recurrence);
          
          await supabase
            .from('recurrences')
            .insert(dbRecurrence);
        }
      }
      
      // Fetch updated recurrence rule
      const { data: recurrenceData } = await supabase
        .from('recurrences')
        .select()
        .eq('event_id', id)
        .maybeSingle();
      
      return toAppEvent(eventData, recurrenceData);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      return null;
    }
  },
  
  async deleteEvent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  }
};
