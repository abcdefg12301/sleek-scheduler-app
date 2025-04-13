
export interface Calendar {
  id: string;
  name: string;
  description: string;
  color: string;
  events: Event[];
  showHolidays?: boolean;
  sleepSchedule?: SleepSchedule;
}

export interface SleepSchedule {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface Holiday {
  id: string;
  name: string;
  date: Date;
  type: string;
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
  isRecurrenceInstance?: boolean;
  originalEventId?: string;
  isHoliday?: boolean;
  isSleep?: boolean;
  isSegment?: boolean;
  segmentType?: 'start' | 'middle' | 'end';
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  endDate?: Date;
  count?: number;
  weekdays?: number[];
}
