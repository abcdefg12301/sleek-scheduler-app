
import { useCalendarStore } from '@/store/calendar-store';
import { toast } from 'sonner';
import { Event } from '@/types';

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
      await addEvent(calendarId, eventData);
      toast.success('Event created successfully');
      return true;
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
      return false;
    }
  };

  const handleUpdateEvent = async (eventId: string, eventData: Omit<Event, 'id' | 'calendarId'>) => {
    try {
      await updateEvent(calendarId, eventId, eventData);
      toast.success('Event updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
      return false;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(calendarId, eventId);
      toast.success('Event deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  };

  const handleDeleteRecurringEvent = async (
    eventId: string, 
    mode: 'single' | 'future' | 'all', 
    date?: Date
  ) => {
    try {
      await deleteRecurringEvent(calendarId, eventId, mode, date);
      const actionText = mode === 'single' ? 'occurrence' : 
                        mode === 'future' ? 'future occurrences' : 
                        'all occurrences';
      toast.success(`Event ${actionText} deleted successfully`);
      return true;
    } catch (error) {
      console.error('Failed to delete recurring event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  };

  const handleHolidaysToggle = async (enabled: boolean) => {
    try {
      await updateCalendar(calendarId, { showHolidays: enabled });
      toast.success(enabled ? 'Holidays enabled' : 'Holidays disabled');
      return true;
    } catch (error) {
      console.error('Failed to update holiday settings:', error);
      toast.error('Failed to update settings');
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
