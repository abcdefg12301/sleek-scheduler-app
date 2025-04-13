
import React from 'react';
import { Calendar, Event, SleepSchedule } from '@/types';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import DailyCalendarView from '@/components/DailyCalendarView';
import DayPreviewBar from '@/components/calendar/DayPreviewBar';
import EventSidebar from '@/components/calendar/EventSidebar';
import EventDialogs from '@/components/calendar/EventDialogs';
import { useCalendarStore } from '@/store/calendar-store';
import { toast } from 'sonner';

type CalendarViewType = 'day' | 'month';

interface CalendarViewContentProps {
  calendar: Calendar;
  viewMode: CalendarViewType;
  currentDate: Date;
  selectedDate: Date;
  events: Event[];
  selectedDateEvents: Event[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: Event) => void;
  handleNewEvent: () => void;
  isNewEventDialogOpen: boolean;
  setIsNewEventDialogOpen: (open: boolean) => void;
  isViewEventDialogOpen: boolean;
  setIsViewEventDialogOpen: (open: boolean) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void; // Added missing prop
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  isSleepScheduleDialogOpen: boolean;
  setIsSleepScheduleDialogOpen: (open: boolean) => void;
}

const CalendarViewContent = ({
  calendar,
  viewMode,
  currentDate,
  selectedDate,
  events,
  selectedDateEvents,
  onDateSelect,
  onEventClick,
  handleNewEvent,
  isNewEventDialogOpen,
  setIsNewEventDialogOpen,
  isViewEventDialogOpen,
  setIsViewEventDialogOpen,
  selectedEvent,
  setSelectedEvent, // Added missing prop
  isEditMode,
  setIsEditMode,
  isSleepScheduleDialogOpen,
  setIsSleepScheduleDialogOpen
}: CalendarViewContentProps) => {
  const { 
    addEvent,
    updateEvent,
    deleteEvent,
    updateCalendar,
    updateSleepSchedule,
    getEventsForDate,
    getEventsForDateRange
  } = useCalendarStore();

  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    try {
      addEvent(calendar.id, eventData);
      setIsNewEventDialogOpen(false);
      toast.success('Event created successfully');
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    }
  };
  
  const handleUpdateEvent = (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    if (!selectedEvent) return;
    
    try {
      updateEvent(calendar.id, selectedEvent.id, eventData);
      setIsViewEventDialogOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null); // Now properly defined
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    }
  };
  
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    
    try {
      deleteEvent(calendar.id, selectedEvent.id);
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null); // Now properly defined
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };
  
  const handleHolidaysToggle = (enabled: boolean) => {
    try {
      updateCalendar(calendar.id, { showHolidays: enabled });
      toast.success(enabled ? 'Holidays enabled' : 'Holidays disabled');
    } catch (error) {
      console.error('Failed to update holiday settings:', error);
      toast.error('Failed to update settings');
    }
  };
  
  const handleSleepScheduleUpdate = (sleepSchedule: SleepSchedule) => {
    try {
      updateSleepSchedule(calendar.id, sleepSchedule);
      setIsSleepScheduleDialogOpen(false);
      toast.success('Sleep schedule updated');
    } catch (error) {
      console.error('Failed to update sleep schedule:', error);
      toast.error('Failed to update sleep schedule');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-3/4">
        {viewMode === 'day' && (
          <DayPreviewBar 
            selectedDate={currentDate}
            onSelectDate={(date) => onDateSelect(date)}
          />
        )}
        
        {viewMode === 'month' ? (
          <MonthlyCalendar
            currentDate={currentDate}
            events={events}
            onDateSelect={onDateSelect}
            onEventClick={onEventClick}
          />
        ) : (
          <DailyCalendarView
            selectedDate={currentDate}
            events={events}
            onEventClick={onEventClick}
          />
        )}
      </div>
      
      <EventSidebar 
        selectedDate={selectedDate}
        selectedDateEvents={selectedDateEvents}
        handleNewEvent={handleNewEvent}
        handleEventClick={onEventClick}
      />
      
      <EventDialogs
        isNewEventDialogOpen={isNewEventDialogOpen}
        setIsNewEventDialogOpen={setIsNewEventDialogOpen}
        isViewEventDialogOpen={isViewEventDialogOpen}
        setIsViewEventDialogOpen={setIsViewEventDialogOpen}
        selectedEvent={selectedEvent}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        selectedDate={selectedDate}
        handleCreateEvent={handleCreateEvent}
        handleUpdateEvent={handleUpdateEvent}
        handleDeleteEvent={handleDeleteEvent}
        isSleepScheduleDialogOpen={isSleepScheduleDialogOpen}
        setIsSleepScheduleDialogOpen={setIsSleepScheduleDialogOpen}
        sleepSchedule={calendar.sleepSchedule}
        handleSleepScheduleUpdate={handleSleepScheduleUpdate}
      />
    </div>
  );
};

export default CalendarViewContent;
