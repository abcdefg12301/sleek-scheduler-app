
import { Holiday, Event } from '@/types';
import { isSameMonth, isSameDay } from 'date-fns';

// Define holidays directly here to avoid circular imports
export const HOLIDAYS: Holiday[] = [
  {
    id: "new-years-day",
    name: "New Year's Day",
    date: new Date(new Date().getFullYear(), 0, 1),
    type: "public"
  },
  {
    id: "independence-day",
    name: "Independence Day",
    date: new Date(new Date().getFullYear(), 6, 4),
    type: "public"
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving Day",
    date: new Date(new Date().getFullYear(), 10, (new Date().getFullYear() === 2023 ? 23 : 28)), // 4th Thursday of November
    type: "public"
  },
  {
    id: "christmas",
    name: "Christmas Day",
    date: new Date(new Date().getFullYear(), 11, 25),
    type: "public"
  }
];

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
