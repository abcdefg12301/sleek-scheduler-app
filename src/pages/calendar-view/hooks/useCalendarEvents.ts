
import { useState, useEffect } from 'react';
import { Event } from '@/types';
import { Calendar } from '@/types';
import { startOfDay, endOfDay, isSameDay } from 'date-fns';
import { useCalendarStore } from '@/store/calendar-store';

type CalendarViewType = 'day' | 'month';

export function useCalendarEvents(
  calendarId: string | undefined,
  calendars: Calendar[],
  currentDate: Date,
  selectedDate: Date,
  viewMode: CalendarViewType
) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const { getEventsForDateRange } = useCalendarStore();

  // Fetch calendar events
  useEffect(() => {
    if (!calendarId) return;
    
    const calendar = calendars.find(cal => cal.id === calendarId);
    if (!calendar) return;
    
    // Get the appropriate date range based on view mode
    const start = viewMode === 'day' 
      ? startOfDay(currentDate)
      : startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    
    const end = viewMode === 'day'
      ? endOfDay(currentDate)
      : endOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
    
    // Get all events for the date range
    const allEvents = getEventsForDateRange(start, end);
    setEvents(allEvents);
    
  }, [calendarId, calendars, currentDate, viewMode, getEventsForDateRange]);
  
  // Update selected date events
  useEffect(() => {
    // Helper function to check if two dates are the same day
    const isSameDayFn = (date1: Date, date2: Date) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };
    
    // Get events for the selected date for the sidebar
    const filteredEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      return (
        isSameDayFn(selectedDate, eventStart) || 
        isSameDayFn(selectedDate, eventEnd) ||
        (eventStart < selectedDate && eventEnd > selectedDate)
      );
    }).sort((a, b) => {
      // Sort all-day events first
      if (a.allDay && !b.allDay) return -1;
      if (b.allDay && !a.allDay) return 1;
      
      // Sort by start time
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
    
    setSelectedDateEvents(filteredEvents);
  }, [events, selectedDate]);
  
  return { events, selectedDateEvents };
}
