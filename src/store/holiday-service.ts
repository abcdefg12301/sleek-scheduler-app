import { Holiday, Event } from '../types';
import { isSameDay, isWithinInterval } from 'date-fns';

// Generate holidays for the current year
const currentYear = new Date().getFullYear();

// Helper function to get the nth weekday of a month
const getNthWeekdayOfMonth = (year: number, month: number, weekday: number, n: number) => {
  let count = 0;
  let day = 1;
  const result = new Date(year, month, day);
  
  while (true) {
    result.setDate(day);
    if (result.getDay() === weekday) {
      count++;
      if (count === n) {
        return result;
      }
    }
    day++;
    if (day > 31 || result.getMonth() !== month) {
      return null; // Failed to find the day
    }
  }
};

// Helper function to get the last weekday of a month
const getLastWeekdayOfMonth = (year: number, month: number, weekday: number) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const result = new Date(year, month, lastDay);
  
  while (result.getDay() !== weekday) {
    result.setDate(result.getDate() - 1);
  }
  
  return result;
};

export const HOLIDAYS: Holiday[] = [
  // Fixed date holidays
  {
    id: 'new-years-day',
    name: "New Year's Day",
    date: new Date(currentYear, 0, 1),
    type: 'public'
  },
  {
    id: 'juneteenth',
    name: "Juneteenth National Independence Day",
    date: new Date(currentYear, 5, 19),
    type: 'public'
  },
  {
    id: 'independence-day',
    name: "Independence Day",
    date: new Date(currentYear, 6, 4),
    type: 'public'
  },
  {
    id: 'veterans-day',
    name: "Veterans Day",
    date: new Date(currentYear, 10, 11),
    type: 'public'
  },
  {
    id: 'christmas-day',
    name: "Christmas Day",
    date: new Date(currentYear, 11, 25),
    type: 'public'
  },

  // Holidays on specific weekdays of months
  {
    id: 'mlk-day',
    name: "Martin Luther King Jr. Day",
    date: getNthWeekdayOfMonth(currentYear, 0, 1, 3) || new Date(currentYear, 0, 15), // 3rd Monday in January
    type: 'public'
  },
  {
    id: 'presidents-day',
    name: "Presidents' Day",
    date: getNthWeekdayOfMonth(currentYear, 1, 1, 3) || new Date(currentYear, 1, 15), // 3rd Monday in February
    type: 'public'
  },
  {
    id: 'memorial-day',
    name: "Memorial Day",
    date: getLastWeekdayOfMonth(currentYear, 4, 1) || new Date(currentYear, 4, 31), // Last Monday in May
    type: 'public'
  },
  {
    id: 'labor-day',
    name: "Labor Day",
    date: getNthWeekdayOfMonth(currentYear, 8, 1, 1) || new Date(currentYear, 8, 1), // 1st Monday in September
    type: 'public'
  },
  {
    id: 'columbus-day',
    name: "Columbus Day",
    date: getNthWeekdayOfMonth(currentYear, 9, 1, 2) || new Date(currentYear, 9, 8), // 2nd Monday in October
    type: 'public'
  },
  {
    id: 'thanksgiving-day',
    name: "Thanksgiving Day",
    date: getNthWeekdayOfMonth(currentYear, 10, 4, 4) || new Date(currentYear, 10, 22), // 4th Thursday in November
    type: 'public'
  },
];

export const holidayService = {
  getHolidaysForDate: (holidays: Holiday[], date: Date): Holiday[] => {
    return holidays.filter(holiday => isSameDay(holiday.date, date));
  },
  
  getHolidaysForDateRange: (startDate: Date, endDate: Date, holidays: Holiday[]): Holiday[] => {
    return holidays.filter(holiday => 
      isWithinInterval(holiday.date, { start: startDate, end: endDate }) ||
      isSameDay(holiday.date, startDate) ||
      isSameDay(holiday.date, endDate)
    );
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
