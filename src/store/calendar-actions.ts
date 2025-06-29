
import { Calendar, Event } from '../types';
import { supabaseService } from "@/services/supabase-service";

export interface CalendarActions {
  addCalendar: (name: string, description: string, color: string, showHolidays?: boolean) => Promise<Calendar>;
  updateCalendar: (id: string, data: Partial<Calendar>) => Promise<void>;
  deleteCalendar: (id: string) => Promise<void>;
  selectCalendar: (id: string | null) => void;
  syncCalendarsFromSupabase: () => Promise<void>;
  initializeStore: () => Promise<void>;
}

export const createCalendarActions = (set: any, get: any): CalendarActions => ({
  async initializeStore() {
    if (get().isInitialized) return;
    
    try {
      await get().syncCalendarsFromSupabase();
      set({ isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ isInitialized: true });
    }
  },

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
        set((state: any) => ({
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
      await get().syncCalendarsFromSupabase();
      
      const calendar = get().calendars.find((cal: Calendar) => cal.id === id);
      if (!calendar) {
        throw new Error(`Calendar with ID ${id} not found`);
      }

      const updatedCalendar = await supabaseService.updateCalendar(id, data);
      if (updatedCalendar) {
        set((state: any) => ({
          calendars: state.calendars.map((cal: Calendar) =>
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
      set((state: any) => ({
        calendars: state.calendars.filter((cal: Calendar) => cal.id !== id),
        selectedCalendarId:
          state.selectedCalendarId === id ? null : state.selectedCalendarId,
      }));
    } catch (error) {
      console.error('Failed to delete calendar:', error);
      throw error;
    }
  },

  selectCalendar: (id) => set(() => ({ selectedCalendarId: id }))
});
