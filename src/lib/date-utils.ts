
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
