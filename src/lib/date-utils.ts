import { addDays, format, getDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';

export function getCalendarDays(date: Date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  return eachDayOfInterval({ start: startDate, end: endDate });
}

export function formatEventTime(date: Date) {
  return format(date, 'h:mm a');
}

export function getDayClass(day: Date, selectedDate: Date, currentMonth: Date) {
  let classes = 'calendar-day';
  
  if (!isSameMonth(day, currentMonth)) {
    classes += ' text-gray-400';
  }
  
  if (isToday(day)) {
    classes += ' today';
  }
  
  if (selectedDate && isSameDay(day, selectedDate)) {
    classes += ' selected';
  }
  
  return classes;
}

export function getTimeOptions() {
  const options = [];
  
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const h = hour % 12 === 0 ? 12 : hour % 12;
      const period = hour < 12 ? 'AM' : 'PM';
      const time = `${h}:${min === 0 ? '00' : min} ${period}`;
      const value = `${hour < 10 ? '0' + hour : hour}:${min === 0 ? '00' : min}`;
      
      options.push({ label: time, value });
    }
  }
  
  return options;
}

export function parseTimeOption(timeStr: string, baseDate: Date) {
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  const result = new Date(baseDate);
  result.setHours(hour, minute, 0, 0);
  
  return result;
}

export function formatDateForDisplay(date: Date) {
  return format(date, 'MMMM d, yyyy');
}

export function formatMonthYear(date: Date) {
  return format(date, 'MMMM yyyy');
}

export function getNextMonth(date: Date) {
  return addMonths(date, 1);
}

export function getPreviousMonth(date: Date) {
  return subMonths(date, 1);
}

/**
 * Parse time string and combine with date
 */
export function parseTimeToDate(timeString: string, date: Date): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Format a date to HH:MM time string
 */
export function formatDateToTimeString(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Format a time string from 24h to 12h format
 */
export function formatTo12Hour(timeString: string): string {
  if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) return timeString;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
