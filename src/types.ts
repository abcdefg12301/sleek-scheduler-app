
export interface Calendar {
  id: string;
  name: string;
  description: string;
  color: string;
  showHolidays: boolean;
  events: Event[]; // Add events property
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
  // Add segment-related properties
  isSegment?: boolean;
  segmentType?: 'start' | 'middle' | 'end';
  // Add recurrence instance property
  isRecurrenceInstance?: boolean;
  originalEventId?: string;
  // Add AI-generated flag
  isAIGenerated?: boolean;
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

// Add Holiday type
export interface Holiday {
  id: string;
  name: string;
  date: Date;
  type: 'public' | 'observance';
}
