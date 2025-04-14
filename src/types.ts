
export interface Calendar {
  id: string;
  name: string;
  description: string;
  color: string;
  events: Event[];
  showHolidays?: boolean;
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
  isSegment?: boolean;
  segmentType?: 'start' | 'middle' | 'end';
  isSleep?: boolean;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  endDate?: Date;
  count?: number;
  weekdays?: number[];
}

// Adding back SleepSchedule type for backward compatibility
// This will be phased out eventually
export interface SleepSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}
