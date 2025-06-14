
import { supabase } from '@/integrations/supabase/client';
import { Event, RecurrenceRule } from '@/types';

export const eventRepo = {
  async fetchForCalendar(calendarId: string): Promise<Event[]> {
    const { data: eventData, error: eventError } = await supabase.from('events').select('*').eq('calendar_id', calendarId);
    if (eventError) throw eventError;
    // ...fetch recurrence rules as before if needed...
    // For brevity: assume recurrence separate, or add logic as in original.
    return eventData.map(ev => ({
      ...ev,
      start: new Date(ev.start_time),
      end: new Date(ev.end_time),
      allDay: ev.all_day,
      color: ev.color,
      calendarId: ev.calendar_id,
      id: ev.id,
      title: ev.title,
      description: ev.description,
      location: ev.location,
      isHoliday: ev.is_holiday,
      isSegment: ev.is_segment,
      segmentType: ev.segment_type,
      isRecurrenceInstance: ev.is_recurrence_instance,
      originalEventId: ev.original_event_id
    }));
  },
  async create(event: Omit<Event, 'id'>): Promise<Event> {
    const { data, error } = await supabase.from('events').insert({
      calendar_id: event.calendarId,
      title: event.title,
      description: event.description || null,
      location: event.location || null,
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      all_day: event.allDay,
      color: event.color || null,
      is_holiday: !!event.isHoliday,
      is_segment: !!event.isSegment,
      segment_type: event.segmentType || null,
      is_recurrence_instance: !!event.isRecurrenceInstance,
      original_event_id: event.originalEventId || null
    }).select().single();
    if (error) throw error;
    return {
      ...event,
      id: data.id
    };
  },
  // add update, delete, recurrence rule methods as needed
};
