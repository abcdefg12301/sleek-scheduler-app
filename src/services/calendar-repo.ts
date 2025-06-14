
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/types';

// Calendar-only DB operations.
export const calendarRepo = {
  async fetchAll(): Promise<Calendar[]> {
    const { data, error } = await supabase.from('calendars').select('*');
    if (error) throw error;
    // hydrate with empty events, caller loads events separately
    return (data ?? []).map(db => ({
      id: db.id,
      name: db.name,
      description: db.description || '',
      color: db.color || '#4285f4',
      showHolidays: db.show_holidays,
      events: []
    }));
  },

  async create(calendar: Omit<Calendar, 'id' | 'events'>): Promise<Calendar> {
    const { data, error } = await supabase.from('calendars').insert({
      name: calendar.name,
      description: calendar.description,
      color: calendar.color,
      show_holidays: calendar.showHolidays
    }).select().single();
    if (error) throw error;
    return { ...data, events: [] };
  },

  async update(id: string, changes: Partial<Calendar>): Promise<Calendar> {
    const update: any = {};
    if (changes.name !== undefined) update.name = changes.name;
    if (changes.description !== undefined) update.description = changes.description;
    if (changes.color !== undefined) update.color = changes.color;
    if (changes.showHolidays !== undefined) update.show_holidays = changes.showHolidays;
    const { data, error } = await supabase.from('calendars').update(update).eq('id', id).select().single();
    if (error) throw error;
    return { ...data, events: [] };
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('calendars').delete().eq('id', id);
    if (error) throw error;
  }
};
