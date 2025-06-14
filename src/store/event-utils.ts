
import { Event } from '@/types';
import { isWithinInterval, isBefore, isAfter, isSameDay } from 'date-fns';
import { generateRecurringEvents } from './recurrence-service';

export function expandEvents(events: Event[], startDate: Date, endDate: Date): Event[] {
  let expandedEvents: Event[] = [];
  events.forEach(event => {
    if (event.recurrence) {
      const recurrences = generateRecurringEvents(event, startDate, endDate);
      expandedEvents = [...expandedEvents, ...recurrences];
    } else {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      if (
        isWithinInterval(eventStart, { start: startDate, end: endDate }) ||
        isWithinInterval(eventEnd, { start: startDate, end: endDate }) ||
        (isBefore(eventStart, startDate) && isAfter(eventEnd, endDate)) ||
        isSameDay(eventStart, startDate) ||
        isSameDay(eventEnd, startDate)
      ) {
        expandedEvents.push(event);
      }
    }
  });
  return expandedEvents;
}

export function sortEvents(events: Event[]): Event[] {
  return events.sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}
