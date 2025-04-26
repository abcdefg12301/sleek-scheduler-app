import { Holiday, Event } from '../types';
import { isSameDay } from 'date-fns';

export const HOLIDAYS: Holiday[] = [
  {
    id: 'new-years-day',
    name: "New Year's Day",
    date: new Date(new Date().getFullYear(), 0, 1),
    type: 'public'
  },
  {
    id: 'christmas-day',
    name: "Christmas Day",
    date: new Date(new Date().getFullYear(), 11, 25),
    type: 'public'
  },
  {
    id: 'valentines-day',
    name: "Valentine's Day",
    date: new Date(new Date().getFullYear(), 1, 14),
    type: 'observance'
  },
];

export const holidayService = {
  getHolidaysForDate: (holidays: Holiday[], date: Date): Holiday[] => {
    return holidays.filter(holiday => isSameDay(holiday.date, date));
  },
  
  holidayToEvent: (holiday: Holiday, calendarId: string): Event => {
    return {
      id: `holiday-${holiday.id}`,
      calendarId,
      title: holiday.name,
      description: `${holiday.type} holiday`,
      start: holiday.date,
      end: holiday.date,
      allDay: true,
      isHoliday: true,
      color: '#e6f7ff'
    };
  }
};
