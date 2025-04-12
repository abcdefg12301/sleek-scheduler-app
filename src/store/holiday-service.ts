
import { Holiday, Event } from '@/types';
import { isSameDay } from 'date-fns';

// Default holidays list
export const HOLIDAYS: Holiday[] = [
  { id: "1", name: "New Year's Day", date: new Date(new Date().getFullYear(), 0, 1), type: "public" },
  { id: "2", name: "Martin Luther King Jr. Day", date: new Date(new Date().getFullYear(), 0, 16), type: "public" },
  { id: "3", name: "Valentine's Day", date: new Date(new Date().getFullYear(), 1, 14), type: "observance" },
  { id: "4", name: "Presidents Day", date: new Date(new Date().getFullYear(), 1, 20), type: "public" },
  { id: "5", name: "Memorial Day", date: new Date(new Date().getFullYear(), 4, 29), type: "public" },
  { id: "6", name: "Independence Day", date: new Date(new Date().getFullYear(), 6, 4), type: "public" },
  { id: "7", name: "Labor Day", date: new Date(new Date().getFullYear(), 8, 4), type: "public" },
  { id: "8", name: "Columbus Day", date: new Date(new Date().getFullYear(), 9, 9), type: "public" },
  { id: "9", name: "Halloween", date: new Date(new Date().getFullYear(), 9, 31), type: "observance" },
  { id: "10", name: "Veterans Day", date: new Date(new Date().getFullYear(), 10, 11), type: "public" },
  { id: "11", name: "Thanksgiving Day", date: new Date(new Date().getFullYear(), 10, 23), type: "public" },
  { id: "12", name: "Christmas Eve", date: new Date(new Date().getFullYear(), 11, 24), type: "observance" },
  { id: "13", name: "Christmas Day", date: new Date(new Date().getFullYear(), 11, 25), type: "public" }
];

// Convert holiday to event
export const holidayToEvent = (holiday: Holiday, calendarId: string): Event => {
  const start = new Date(holiday.date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(holiday.date);
  end.setHours(23, 59, 59, 999);
  
  return {
    id: `holiday-${holiday.id}-${calendarId}`,
    calendarId,
    title: holiday.name,
    description: `${holiday.type} holiday`,
    start,
    end,
    allDay: true,
    color: '#f59e0b' // Amber color for holidays
  };
};

// Get holidays for a specific date
export const getHolidaysForDate = (
  holidays: Holiday[],
  date: Date
): Holiday[] => {
  return holidays.filter(holiday => isSameDay(holiday.date, date));
};
