export interface Calendar {
  id: string;
  name: string;
  description: string;
  color: string;
  showHolidays: boolean;
}

export interface Event {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  recurrence?: RecurrenceRule;
  isHoliday?: boolean;
}

// Alias for better semantics in our calendar application
export type CalendarEvent = Event;

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
}

export interface SleepSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export type CalendarViewType = 'day' | 'week' | 'month';
