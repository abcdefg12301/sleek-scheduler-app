
import { supabase } from '@/integrations/supabase/client';
import { Event, RecurrenceRule } from '@/types';
import { toast } from 'sonner';

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

export const eventRepository = {
  async fetchForCalendar(calendarId: string): Promise<Event[]> {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('calendar_id', calendarId);
      
      if (eventError) throw eventError;
      
      const eventIds = eventData.map(e => e.id);
      const { data: recurrenceData, error: recurrenceError } = await supabase
        .from('recurrences')
        .select('*')
        .in('event_id', eventIds);
      
      if (recurrenceError && eventIds.length > 0) throw recurrenceError;
      
      const recurrenceMap = new Map<string, DbRecurrence>();
      if (recurrenceData) {
        recurrenceData.forEach(r => recurrenceMap.set(r.event_id, r));
      }
      
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
  
  async create(event: Omit<Event, 'id'>): Promise<Event | null> {
    try {
      const dbEvent = toDbEvent({ ...event, id: '' });
      
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert(dbEvent)
        .select()
        .single();
      
      if (eventError) throw eventError;
      
      let recurrenceData = null;
      
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
  
  async update(id: string, event: Partial<Event>): Promise<Event | null> {
    try {
      const dbEventUpdate: any = {};
      
      if (event.title !== undefined) dbEventUpdate.title = event.title;
      if (event.description !== undefined) dbEventUpdate.description = event.description;
      if (event.location !== undefined) dbEventUpdate.location = event.location;
      if (event.start !== undefined) dbEventUpdate.start_time = event.start.toISOString();
      if (event.end !== undefined) dbEventUpdate.end_time = event.end.toISOString();
      if (event.allDay !== undefined) dbEventUpdate.all_day = event.allDay;
      if (event.color !== undefined) dbEventUpdate.color = event.color;
      
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .update(dbEventUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (eventError) throw eventError;
      
      if (event.recurrence !== undefined) {
        await supabase
          .from('recurrences')
          .delete()
          .eq('event_id', id);
        
        if (event.recurrence) {
          const dbRecurrence = toDbRecurrence(id, event.recurrence);
          
          await supabase
            .from('recurrences')
            .insert(dbRecurrence);
        }
      }
      
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
  
  async delete(id: string): Promise<boolean> {
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
