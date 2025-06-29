
import { Calendar, Event } from '@/types';
import { calendarRepository } from './supabase/calendar-repository';
import { eventRepository } from './supabase/event-repository';

export const supabaseService = {
  // Calendar methods
  async fetchCalendars(): Promise<Calendar[]> {
    const calendars = await calendarRepository.fetchAll();
    
    // Fetch events for each calendar
    for (const calendar of calendars) {
      const events = await eventRepository.fetchForCalendar(calendar.id);
      calendar.events = events;
    }
    
    return calendars;
  },
  
  async createCalendar(calendar: Omit<Calendar, 'id' | 'events'>): Promise<Calendar | null> {
    return await calendarRepository.create(calendar);
  },
  
  async updateCalendar(id: string, calendar: Partial<Calendar>): Promise<Calendar | null> {
    return await calendarRepository.update(id, calendar);
  },
  
  async deleteCalendar(id: string): Promise<boolean> {
    return await calendarRepository.delete(id);
  },
  
  // Event methods
  async fetchEventsForCalendar(calendarId: string): Promise<Event[]> {
    return await eventRepository.fetchForCalendar(calendarId);
  },
  
  async createEvent(event: Omit<Event, 'id'>): Promise<Event | null> {
    return await eventRepository.create(event);
  },
  
  async updateEvent(id: string, event: Partial<Event>): Promise<Event | null> {
    return await eventRepository.update(id, event);
  },
  
  async deleteEvent(id: string): Promise<boolean> {
    return await eventRepository.delete(id);
  }
};
