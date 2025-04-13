
import { Holiday, Event } from '@/types';
import { isSameMonth, isSameDay } from 'date-fns';

// Re-export the HOLIDAYS constant from the original file
export { HOLIDAYS } from './holiday-service';

/**
 * Service to handle holiday-related operations
 */
export const holidayService = {
  /**
   * Converts a holiday to an event object
   */
  holidayToEvent: (holiday: Holiday, calendarId: string): Event => {
    const holidayDate = new Date(holiday.date);
    
    return {
      id: `holiday-${holiday.id}-${calendarId}`,
      calendarId: calendarId,
      title: holiday.name,
      description: `${holiday.name} - Public Holiday`,
      start: holidayDate,
      end: holidayDate,
      allDay: true,
      color: '#10B981', // Green color for holidays
      isHoliday: true
    };
  },
  
  /**
   * Gets holidays for a specific date
   */
  getHolidaysForDate: (holidays: Holiday[], date: Date): Holiday[] => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(holidayDate, date);
    });
  },
  
  /**
   * Gets holidays for a specific month
   */
  getHolidaysForMonth: (holidays: Holiday[], date: Date): Holiday[] => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameMonth(holidayDate, date);
    });
  }
};
