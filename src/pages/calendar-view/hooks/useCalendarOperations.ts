
import { useCalendarStore } from '@/store/calendar-store';
import { toast } from 'sonner';
import { Event } from '@/types';
import { calendarService } from '@/services/calendar-service';
import { eventServiceRepo } from '@/services/event-service-repo';

export function useCalendarOperations(calendarId: string) {
  const {
    addEvent,
    updateEvent,
    deleteEvent,
    deleteRecurringEvent,
    updateCalendar
  } = useCalendarStore();

  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    try {
      await eventServiceRepo.createEvent(calendarId, eventData);
      toast.success('Event created successfully');
      return true;
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
      return false;
    }
  };

  const handleUpdateEvent = async (eventId: string, eventData: Omit<Event, 'id' | 'calendarId'>) => {
    try {
      await eventServiceRepo.updateEvent(eventId, eventData);
      toast.success('Event updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update event');
      return false;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventServiceRepo.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete event');
      return false;
    }
  };

  const handleDeleteRecurringEvent = async (eventId: string, mode: 'single' | 'future' | 'all', date?: Date) => {
    try {
      await deleteRecurringEvent(calendarId, eventId, mode, date);
      
      const actionText = mode === 'single' ? 'occurrence' : 
                        mode === 'future' ? 'future occurrences' : 
                        'all occurrences';
      toast.success(`Event ${actionText} deleted successfully`);
      return true;
    } catch (error) {
      console.error('Failed to delete recurring event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete event');
      return false;
    }
  };

  const handleHolidaysToggle = async (enabled: boolean) => {
    try {
      await calendarService.updateCalendar(calendarId, { showHolidays: enabled });
      toast.success(enabled ? 'Holidays enabled' : 'Holidays disabled');
      return true;
    } catch (error) {
      console.error('Failed to update holiday settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
      return false;
    }
  };

  return {
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleDeleteRecurringEvent,
    handleHolidaysToggle
  };
}
