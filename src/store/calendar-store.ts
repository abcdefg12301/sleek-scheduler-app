
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calendar, Event, SleepSchedule, Holiday } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, format, isSameDay, addMonths } from 'date-fns';

interface CalendarState {
  calendars: Calendar[];
  selectedCalendarId: string | null;
  holidays: Holiday[];
  
  // Calendar actions
  addCalendar: (name: string, description: string, color: string, showHolidays?: boolean, sleepSchedule?: SleepSchedule) => Calendar;
  updateCalendar: (id: string, data: Partial<Calendar>) => void;
  deleteCalendar: (id: string) => void;
  selectCalendar: (id: string | null) => void;
  
  // Event actions
  addEvent: (calendarId: string, event: Omit<Event, 'id' | 'calendarId'>) => Event;
  updateEvent: (calendarId: string, eventId: string, data: Partial<Event>) => void;
  deleteEvent: (calendarId: string, eventId: string) => void;
  getEventsForDate: (date: Date) => Event[];
  getEventsForDateRange: (startDate: Date, endDate: Date) => Event[];
  
  // Holiday actions
  initializeHolidays: () => void;
  getHolidaysForCalendar: (calendarId: string, date: Date) => Holiday[];
  
  // Sleep schedule
  updateSleepSchedule: (calendarId: string, sleepSchedule: SleepSchedule) => void;
  generateSleepEvents: (calendarId: string, startDate: Date, sleepSchedule: SleepSchedule) => void;
}

const HOLIDAYS: Holiday[] = [
  { id: "1", name: "New Year's Day", date: new Date(new Date().getFullYear(), 0, 1), type: "public" },
  { id: "2", name: "Martin Luther King Jr. Day", date: new Date(new Date().getFullYear(), 0, 16), type: "public" },
  { id: "3", name: "Valentine's Day", date: new Date(new Date().getFullYear(), 1, 14), type: "observance" },
  { id: "4", name: "Presidents Day", date: new Date(new Date().getFullYear(), 1, 20), type: "public" },
  { id: "5", name: "Memorial Day", date: new Date(new Date().getFullYear(), 4, 29), type: "public" },
  { id: "6", name: "Independence Day", date: new Date(new Date().getFullYear(), 6, 4), type: "public" },
  { id: "7", name: "Labor Day", date: new Date(new Date().getFullYear(), 8, 4), type: "public" },
  { id: "8", name: "Columbus Day", date: new Date(new Date().getFullYear(), 9, 9), type: "public" },
  { id: "9", name: "Halloween", date: new Date(new Date().getFullYear(), 9, 31), type: "observance" },
  { id: "10", name: "Veterans Day", date: new Date(new Date().getFullYear(), 10, 11), type: "public" },
  { id: "11", name: "Thanksgiving Day", date: new Date(new Date().getFullYear(), 10, 23), type: "public" },
  { id: "12", name: "Christmas Eve", date: new Date(new Date().getFullYear(), 11, 24), type: "observance" },
  { id: "13", name: "Christmas Day", date: new Date(new Date().getFullYear(), 11, 25), type: "public" }
];

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      calendars: [],
      selectedCalendarId: null,
      holidays: HOLIDAYS,
      
      initializeHolidays: () => {
        console.log("Initializing holidays");
        set({ holidays: HOLIDAYS });
      },
      
      getHolidaysForCalendar: (calendarId, date) => {
        console.log("Getting holidays for calendar", calendarId, "and date", date);
        const calendar = get().calendars.find(cal => cal.id === calendarId);
        if (!calendar || !calendar.showHolidays) return [];
        
        return get().holidays.filter(holiday => 
          isSameDay(holiday.date, date)
        );
      },
      
      updateSleepSchedule: (calendarId, sleepSchedule) => {
        console.log("Updating sleep schedule for calendar", calendarId, sleepSchedule);
        
        // First, remove all existing sleep events
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === calendarId 
              ? { 
                  ...calendar, 
                  sleepSchedule,
                  events: calendar.events.filter(event => event.title !== 'Sleep')
                } 
              : calendar
          )
        }));
        
        // Then generate new sleep events if enabled
        if (sleepSchedule.enabled) {
          const today = new Date();
          get().generateSleepEvents(calendarId, today, sleepSchedule);
        }
      },
      
      generateSleepEvents: (calendarId, startDate, sleepSchedule) => {
        console.log("Generating sleep events for calendar", calendarId);
        
        if (!sleepSchedule.enabled) return;
        
        // Generate sleep events for the next 12 months
        const calendar = get().calendars.find(cal => cal.id === calendarId);
        if (!calendar) return;
        
        // Clear existing sleep events first
        set((state) => ({
          calendars: state.calendars.map((cal) => 
            cal.id === calendarId 
              ? { 
                  ...cal, 
                  events: cal.events.filter(event => event.title !== 'Sleep')
                } 
              : cal
          )
        }));
        
        const endDate = addMonths(startDate, 12); // Create events for the next 12 months
        const [startHour, startMinute] = sleepSchedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = sleepSchedule.endTime.split(':').map(Number);
        
        // Generate one event for each day
        let currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0); // Start from beginning of day
        
        while (currentDate <= endDate) {
          const sleepStart = new Date(currentDate);
          sleepStart.setHours(startHour, startMinute, 0, 0);
          
          // Sleep end is the next day if end time is earlier than start time
          let sleepEnd = new Date(currentDate);
          if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
            sleepEnd = addDays(sleepEnd, 1); // Sleep ends next day
          }
          sleepEnd.setHours(endHour, endMinute, 0, 0);
          
          const sleepEvent: Omit<Event, 'id' | 'calendarId'> = {
            title: 'Sleep',
            description: 'Sleep time',
            start: sleepStart,
            end: sleepEnd,
            allDay: false,
            color: '#3730a3'
          };
          
          get().addEvent(calendarId, sleepEvent);
          
          // Move to next day
          currentDate = addDays(currentDate, 1);
        }
      },
      
      addCalendar: (name, description, color, showHolidays = true, sleepSchedule) => {
        console.log("Adding new calendar:", name, description, color, showHolidays, sleepSchedule);
        const defaultSleepSchedule = { 
          enabled: false, 
          startTime: '22:00', 
          endTime: '06:00' 
        };
        
        const newCalendar: Calendar = {
          id: uuidv4(),
          name,
          description,
          color,
          events: [],
          showHolidays,
          sleepSchedule: sleepSchedule || defaultSleepSchedule
        };
        
        set((state) => ({
          calendars: [...state.calendars, newCalendar],
          selectedCalendarId: newCalendar.id
        }));
        
        // Generate sleep events if sleep schedule is enabled
        if (sleepSchedule?.enabled) {
          console.log("Generating sleep events for new calendar");
          const today = new Date();
          get().generateSleepEvents(newCalendar.id, today, sleepSchedule);
        }
        
        return newCalendar;
      },
      
      updateCalendar: (id, data) => {
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === id ? { ...calendar, ...data } : calendar
          )
        }));
      },
      
      deleteCalendar: (id) => {
        set((state) => ({
          calendars: state.calendars.filter((calendar) => calendar.id !== id),
          selectedCalendarId: state.selectedCalendarId === id ? null : state.selectedCalendarId
        }));
      },
      
      selectCalendar: (id) => {
        set(() => ({ selectedCalendarId: id }));
      },
      
      addEvent: (calendarId, eventData) => {
        console.log("Adding event to calendar", calendarId, eventData);
        const newEvent: Event = {
          id: uuidv4(),
          calendarId,
          ...eventData
        };
        
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === calendarId 
              ? { ...calendar, events: [...calendar.events, newEvent] } 
              : calendar
          )
        }));
        
        return newEvent;
      },
      
      updateEvent: (calendarId, eventId, data) => {
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === calendarId 
              ? {
                  ...calendar,
                  events: calendar.events.map((event) => 
                    event.id === eventId ? { ...event, ...data } : event
                  )
                } 
              : calendar
          )
        }));
      },
      
      deleteEvent: (calendarId, eventId) => {
        set((state) => ({
          calendars: state.calendars.map((calendar) => 
            calendar.id === calendarId 
              ? {
                  ...calendar,
                  events: calendar.events.filter((event) => event.id !== eventId)
                } 
              : calendar
          )
        }));
      },
      
      getEventsForDate: (date) => {
        const { calendars } = get();
        const dateStr = date.toISOString().split('T')[0];
        console.log("Getting events for date", dateStr);
        
        const calendarEvents = calendars.flatMap((calendar) => {
          const events = calendar.events.filter((event) => {
            const eventStartDate = new Date(event.start).toISOString().split('T')[0];
            const eventEndDate = new Date(event.end).toISOString().split('T')[0];
            
            return eventStartDate <= dateStr && eventEndDate >= dateStr;
          });
          
          // Add holiday events if enabled for the calendar
          if (calendar.showHolidays) {
            const holidaysForDate = get().holidays.filter(h => 
              isSameDay(h.date, new Date(dateStr))
            ).map(holiday => ({
              id: `holiday-${holiday.id}-${calendar.id}`,
              calendarId: calendar.id,
              title: holiday.name,
              start: new Date(dateStr),
              end: new Date(dateStr),
              allDay: true,
              color: '#f59e0b'
            }));
            
            return [...events, ...holidaysForDate];
          }
          
          return events;
        });
        
        return calendarEvents.sort((a, b) => {
          // Sort all-day events first, then by start time
          if (a.allDay && !b.allDay) return -1;
          if (!b.allDay && a.allDay) return 1;
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        });
      },
      
      getEventsForDateRange: (startDate, endDate) => {
        const { calendars } = get();
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        console.log("Getting events for date range", startStr, "to", endStr);
        
        const calendarEvents = calendars.flatMap((calendar) => {
          const events = calendar.events.filter((event) => {
            const eventStartDate = new Date(event.start).toISOString().split('T')[0];
            const eventEndDate = new Date(event.end).toISOString().split('T')[0];
            
            // Check if the event overlaps with the date range
            return (eventStartDate <= endStr && eventEndDate >= startStr);
          });
          
          return events;
        });
        
        return calendarEvents.sort((a, b) => {
          // Sort all-day events first, then by start time
          if (a.allDay && !b.allDay) return -1;
          if (!b.allDay && a.allDay) return 1;
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        });
      }
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({ 
        calendars: state.calendars,
        selectedCalendarId: state.selectedCalendarId,
        holidays: state.holidays
      }),
    }
  )
);
