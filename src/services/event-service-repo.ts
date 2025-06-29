
import { Event } from '@/types';
import { supabaseService } from './supabase-service';

/**
 * High-level event service that handles business logic
 */
export const eventServiceRepo = {
  /**
   * Creates a new event with validation
   */
  async createEvent(calendarId: string, eventData: Omit<Event, 'id' | 'calendarId'>): Promise<Event> {
    if (!calendarId) {
      throw new Error('Calendar ID is required');
    }
    
    if (!eventData.title || eventData.title.trim().length === 0) {
      throw new Error('Event title is required');
    }
    
    if (!eventData.start || !eventData.end) {
      throw new Error('Event start and end times are required');
    }
    
    if (new Date(eventData.start) >= new Date(eventData.end)) {
      throw new Error('Event end time must be after start time');
    }
    
    const result = await supabaseService.createEvent({
      ...eventData,
      calendarId
    });
    
    if (!result) {
      throw new Error('Failed to create event');
    }
    
    return result;
  },

  /**
   * Updates an event with validation
   */
  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    if (!eventId) {
      throw new Error('Event ID is required');
    }
    
    if (eventData.title !== undefined && eventData.title.trim().length === 0) {
      throw new Error('Event title cannot be empty');
    }
    
    if (eventData.start && eventData.end && new Date(eventData.start) >= new Date(eventData.end)) {
      throw new Error('Event end time must be after start time');
    }
    
    const result = await supabaseService.updateEvent(eventId, eventData);
    if (!result) {
      throw new Error('Failed to update event');
    }
    
    return result;
  },

  /**
   * Deletes an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    if (!eventId) {
      throw new Error('Event ID is required');
    }
    
    const success = await supabaseService.deleteEvent(eventId);
    if (!success) {
      throw new Error('Failed to delete event');
    }
  }
};
