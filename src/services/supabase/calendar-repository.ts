
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/types';
import { toast } from 'sonner';

interface DbCalendar {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  show_holidays: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

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

const toDbCalendar = (appCalendar: Calendar, userId: string): Omit<DbCalendar, 'id' | 'created_at' | 'updated_at'> => {
  return {
    name: appCalendar.name,
    description: appCalendar.description,
    color: appCalendar.color,
    show_holidays: appCalendar.showHolidays,
    user_id: userId
  };
};

export const calendarRepository = {
  async fetchAll(): Promise<Calendar[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user');
        return [];
      }

      const { data, error } = await supabase
        .from('calendars')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      return data.map(toAppCalendar);
    } catch (error) {
      console.error('Error fetching calendars:', error);
      toast.error('Failed to load calendars');
      return [];
    }
  },
  
  async create(calendar: Omit<Calendar, 'id' | 'events'>): Promise<Calendar | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a calendar');
        return null;
      }

      const dbCalendar = toDbCalendar({ ...calendar, id: '', events: [] }, user.id);
      
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
  
  async update(id: string, calendar: Partial<Calendar>): Promise<Calendar | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to update a calendar');
        return null;
      }

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
        .eq('user_id', user.id)
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
  
  async delete(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to delete a calendar');
        return false;
      }

      const { error } = await supabase
        .from('calendars')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting calendar:', error);
      toast.error('Failed to delete calendar');
      return false;
    }
  }
};
