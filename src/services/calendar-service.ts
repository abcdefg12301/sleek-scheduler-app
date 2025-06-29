
import { Calendar, Event } from '@/types';
import { supabaseService } from './supabase-service';

/**
 * High-level calendar service that handles business logic
 */
export const calendarService = {
  /**
   * Creates a new calendar with validation
   */
  async createCalendar(data: Omit<Calendar, 'id' | 'events'>): Promise<Calendar> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Calendar name is required');
    }
    
    return await supabaseService.createCalendar(data);
  },

  /**
   * Updates a calendar with proper error handling
   */
  async updateCalendar(id: string, data: Partial<Calendar>): Promise<Calendar> {
    if (!id) {
      throw new Error('Calendar ID is required');
    }
    
    // Validate the data before updating
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Calendar name cannot be empty');
    }
    
    const result = await supabaseService.updateCalendar(id, data);
    if (!result) {
      throw new Error('Failed to update calendar');
    }
    
    return result;
  },

  /**
   * Deletes a calendar and all its events
   */
  async deleteCalendar(id: string): Promise<void> {
    if (!id) {
      throw new Error('Calendar ID is required');
    }
    
    const success = await supabaseService.deleteCalendar(id);
    if (!success) {
      throw new Error('Failed to delete calendar');
    }
  },

  /**
   * Fetches all calendars with their events
   */
  async fetchCalendars(): Promise<Calendar[]> {
    return await supabaseService.fetchCalendars();
  }
};
