
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
      console.log('Initializing calendar store...');
      await get().syncCalendarsFromSupabase();
      set({ isInitialized: true });
      console.log('Calendar store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ isInitialized: true, calendars: [] });
    }
  },

  async syncCalendarsFromSupabase() {
    try {
      console.log('Syncing calendars from Supabase...');
      const calendars = await supabaseService.fetchCalendars();
      console.log('Fetched calendars:', calendars.length);
      set({ calendars });
    } catch (error) {
      console.error('Failed to sync calendars:', error);
      throw error;
    }
  },

  async addCalendar(name, description, color, showHolidays = true) {
    try {
      console.log('Creating calendar:', { name, description, color, showHolidays });
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
        console.log('Calendar created successfully:', calendar.id);
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
      console.log('Updating calendar:', id, data);
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
        console.log('Calendar updated successfully:', id);
      }
    } catch (error) {
      console.error('Failed to update calendar:', error);
      throw error;
    }
  },

  async deleteCalendar(id) {
    try {
      console.log('Deleting calendar:', id);
      await supabaseService.deleteCalendar(id);
      set((state: any) => ({
        calendars: state.calendars.filter((cal: Calendar) => cal.id !== id),
        selectedCalendarId:
          state.selectedCalendarId === id ? null : state.selectedCalendarId,
      }));
      console.log('Calendar deleted successfully:', id);
    } catch (error) {
      console.error('Failed to delete calendar:', error);
      throw error;
    }
  },

  selectCalendar: (id) => {
    console.log('Selecting calendar:', id);
    set(() => ({ selectedCalendarId: id }));
  }
});
