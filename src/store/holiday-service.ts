
import { Holiday, Event } from '@/types';
import { isSameMonth, isSameDay, getYear, setYear } from 'date-fns';

// Define holidays for multiple years
const createHolidays = (year: number): Holiday[] => [
  // New Year's Day
  {
    id: `new-years-day-${year}`,
    name: "New Year's Day",
    date: new Date(year, 0, 1),
    type: "public"
  },
  // Martin Luther King Jr. Day (third Monday in January)
  {
    id: `mlk-day-${year}`,
    name: "Martin Luther King Jr. Day",
    date: new Date(year, 0, 15 + (1 + 7 - new Date(year, 0, 15).getDay()) % 7),
    type: "public"
  },
  // Presidents' Day (third Monday in February)
  {
    id: `presidents-day-${year}`,
    name: "Presidents' Day",
    date: new Date(year, 1, 15 + (1 + 7 - new Date(year, 1, 15).getDay()) % 7),
    type: "public"
  },
  // Memorial Day (last Monday in May)
  {
    id: `memorial-day-${year}`,
    name: "Memorial Day",
    date: new Date(year, 4, 31 - ((new Date(year, 4, 31).getDay() + 6) % 7)),
    type: "public"
  },
  // Independence Day
  {
    id: `independence-day-${year}`,
    name: "Independence Day",
    date: new Date(year, 6, 4),
    type: "public"
  },
  // Labor Day (first Monday in September)
  {
    id: `labor-day-${year}`,
    name: "Labor Day",
    date: new Date(year, 8, 1 + (1 + 7 - new Date(year, 8, 1).getDay()) % 7),
    type: "public"
  },
  // Columbus Day / Indigenous Peoples' Day (second Monday in October)
  {
    id: `columbus-day-${year}`,
    name: "Columbus Day",
    date: new Date(year, 9, 8 + (1 + 7 - new Date(year, 9, 8).getDay()) % 7),
    type: "public"
  },
  // Veterans Day
  {
    id: `veterans-day-${year}`,
    name: "Veterans Day",
    date: new Date(year, 10, 11),
    type: "public"
  },
  // Thanksgiving (fourth Thursday in November)
  {
    id: `thanksgiving-day-${year}`,
    name: "Thanksgiving Day",
    date: new Date(year, 10, 22 + (4 + 7 - new Date(year, 10, 22).getDay()) % 7),
    type: "public"
  },
  // Christmas Day
  {
    id: `christmas-day-${year}`,
    name: "Christmas Day",
    date: new Date(year, 11, 25),
    type: "public"
  },
  // New Year's Eve
  {
    id: `new-years-eve-${year}`,
    name: "New Year's Eve",
    date: new Date(year, 11, 31),
    type: "public"
  },
  // Valentine's Day
  {
    id: `valentines-day-${year}`,
    name: "Valentine's Day",
    date: new Date(year, 1, 14),
    type: "observance"
  },
  // St. Patrick's Day
  {
    id: `st-patricks-day-${year}`,
    name: "St. Patrick's Day",
    date: new Date(year, 2, 17),
    type: "observance"
  },
  // Mother's Day (second Sunday in May)
  {
    id: `mothers-day-${year}`,
    name: "Mother's Day",
    date: new Date(year, 4, 8 + (0 + 7 - new Date(year, 4, 8).getDay()) % 7),
    type: "observance"
  },
  // Father's Day (third Sunday in June)
  {
    id: `fathers-day-${year}`,
    name: "Father's Day",
    date: new Date(year, 5, 15 + (0 + 7 - new Date(year, 5, 15).getDay()) % 7),
    type: "observance"
  },
  // Halloween
  {
    id: `halloween-${year}`,
    name: "Halloween",
    date: new Date(year, 9, 31),
    type: "observance"
  },
];

// Create holidays for current year, past, and future
const currentYear = new Date().getFullYear();
export const HOLIDAYS: Holiday[] = [
  ...createHolidays(currentYear - 1),
  ...createHolidays(currentYear),
  ...createHolidays(currentYear + 1),
  ...createHolidays(currentYear + 2),
  ...createHolidays(currentYear + 3)
];

console.log(`Loaded ${HOLIDAYS.length} holidays spanning multiple years`);

/**
 * Service to handle holiday-related operations
 */
export const holidayService = {
  /**
   * Converts a holiday to an event object
   */
  holidayToEvent: (holiday: Holiday, calendarId: string): Event => {
    const holidayDate = new Date(holiday.date);
    
    console.log(`Converting holiday to event: ${holiday.name} on ${holidayDate.toDateString()}`);
    
    return {
      id: `holiday-${holiday.id}-${calendarId}`,
      calendarId: calendarId,
      title: holiday.name,
      description: `${holiday.name} - ${holiday.type === 'public' ? 'Public Holiday' : 'Observance'}`,
      start: holidayDate,
      end: holidayDate,
      allDay: true,
      color: '#60A5FA', // Light blue for all holidays
      isHoliday: true
    };
  },
  
  /**
   * Gets holidays for a specific date
   */
  getHolidaysForDate: (holidays: Holiday[], date: Date): Holiday[] => {
    const foundHolidays = holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(holidayDate, date);
    });
    
    if (foundHolidays.length > 0) {
      console.log(`Found ${foundHolidays.length} holidays for ${date.toDateString()}:`, 
        foundHolidays.map(h => h.name).join(', '));
    }
    
    return foundHolidays;
  },
  
  /**
   * Gets holidays for a specific month
   */
  getHolidaysForMonth: (holidays: Holiday[], date: Date): Holiday[] => {
    const foundHolidays = holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameMonth(holidayDate, date);
    });
    
    console.log(`Found ${foundHolidays.length} holidays for month ${date.toISOString().substring(0, 7)}`);
    
    return foundHolidays;
  }
};
