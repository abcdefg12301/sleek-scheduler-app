
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addMonths, subMonths, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { Event, SleepSchedule } from '@/types';
import { useCalendarStore } from '@/store/calendar-store';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import DailyCalendarView from '@/components/DailyCalendarView';
import CalendarNavigation from '@/components/calendar/CalendarNavigation';
import CalendarSettings from '@/components/calendar/CalendarSettings';
import EventSidebar from '@/components/calendar/EventSidebar';
import EventDialogs from '@/components/calendar/EventDialogs';
import DayPreviewBar from '@/components/calendar/DayPreviewBar';
import { toast } from 'sonner';

type CalendarViewType = 'day' | 'month';

const CalendarView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    calendars, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    updateCalendar, 
    updateSleepSchedule, 
    getExpandedEvents,
    getEventsForDateRange,
    getEventsForDate
  } = useCalendarStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<CalendarViewType>('month');
  const [isSleepScheduleDialogOpen, setIsSleepScheduleDialogOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  
  const calendar = calendars.find(cal => cal.id === id);
  
  // Fetch calendar events including sleep schedule and holidays
  useEffect(() => {
    if (!calendar || !id) return;
    
    // Get the appropriate date range based on view mode
    const start = viewMode === 'day' 
      ? startOfDay(currentDate)
      : startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    
    const end = viewMode === 'day'
      ? endOfDay(currentDate)
      : endOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
    
    // Get all events for the date range
    const allEvents = getEventsForDateRange(start, end);
    setEvents(allEvents);
    
    console.log(`Loaded ${allEvents.length} events for ${viewMode} view:`, start, end);
  }, [calendar, id, currentDate, viewMode, calendars]);
  
  useEffect(() => {
    if (!calendar && id) {
      console.error('Calendar not found with ID:', id);
      navigate('/');
    }
  }, [id, calendar, navigate]);
  
  if (!calendar || !id) {
    return null;
  }
  
  const handlePrevPeriod = () => {
    if (viewMode === 'day') {
      setCurrentDate(subDays(currentDate, 1));
      setSelectedDate(subDays(selectedDate, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };
  
  const handleNextPeriod = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1));
      setSelectedDate(addDays(selectedDate, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Switch to day view when clicking a day in month view
    if (viewMode === 'month') {
      setViewMode('day');
      setCurrentDate(date);
    }
  };
  
  const handleTodayClick = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };
  
  const handleNewEvent = () => {
    setIsNewEventDialogOpen(true);
  };
  
  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    try {
      const newEvent = addEvent(id, eventData);
      
      // Refresh events list
      const dayEvents = getEventsForDate(selectedDate);
      setEvents(prev => [...prev.filter(e => !isSameDay(e.start, selectedDate)), ...dayEvents]);
      
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
      updateEvent(id, selectedEvent.id, eventData);
      
      // Refresh events list
      const start = viewMode === 'day' 
        ? startOfDay(currentDate)
        : startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      
      const end = viewMode === 'day'
        ? endOfDay(currentDate)
        : endOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
      
      const updatedEvents = getEventsForDateRange(start, end);
      setEvents(updatedEvents);
      
      setIsViewEventDialogOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    }
  };
  
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    
    try {
      deleteEvent(id, selectedEvent.id);
      
      // Refresh events list
      const updatedEvents = events.filter(event => 
        event.id !== selectedEvent.id && event.originalEventId !== selectedEvent.id
      );
      setEvents(updatedEvents);
      
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
    setIsEditMode(false);
  };
  
  const handleHolidaysToggle = (enabled: boolean) => {
    try {
      updateCalendar(id, { showHolidays: enabled });
      
      // Refresh events list to include/exclude holidays
      const start = viewMode === 'day' 
        ? startOfDay(currentDate)
        : startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      
      const end = viewMode === 'day'
        ? endOfDay(currentDate)
        : endOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
      
      const updatedEvents = getEventsForDateRange(start, end);
      setEvents(updatedEvents);
      
      toast.success(enabled ? 'Holidays enabled' : 'Holidays disabled');
    } catch (error) {
      console.error('Failed to update holiday settings:', error);
      toast.error('Failed to update settings');
    }
  };
  
  const handleSleepScheduleUpdate = (sleepSchedule: SleepSchedule) => {
    try {
      updateSleepSchedule(id, sleepSchedule);
      
      // Refresh events list to include updated sleep schedule
      const start = viewMode === 'day' 
        ? startOfDay(currentDate)
        : startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      
      const end = viewMode === 'day'
        ? endOfDay(currentDate)
        : endOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
      
      const updatedEvents = getEventsForDateRange(start, end);
      setEvents(updatedEvents);
      
      setIsSleepScheduleDialogOpen(false);
      toast.success('Sleep schedule updated');
    } catch (error) {
      console.error('Failed to update sleep schedule:', error);
      toast.error('Failed to update sleep schedule');
    }
  };
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  // Get events for the selected date for the sidebar
  const selectedDateEvents = events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    return (
      isSameDay(selectedDate, eventStart) || 
      isSameDay(selectedDate, eventEnd) ||
      (eventStart < selectedDate && eventEnd > selectedDate)
    );
  }).sort((a, b) => {
    // Sort all-day events first
    if (a.allDay && !b.allDay) return -1;
    if (b.allDay && !a.allDay) return 1;
    
    // Sort by start time
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
  
  // Filter out recurrence instances for event count display
  const uniqueEventCount = (() => {
    const baseEvents = calendar.events.filter(e => !e.isRecurrenceInstance);
    return baseEvents.length;
  })();
  
  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
            <CalendarNavigation
              calendarName={calendar.name}
              calendarColor={calendar.color}
              currentDate={currentDate}
              viewMode={viewMode}
              setViewMode={setViewMode}
              handlePrevPeriod={handlePrevPeriod}
              handleNextPeriod={handleNextPeriod}
              handleTodayClick={handleTodayClick}
            />
            <CalendarSettings 
              calendarId={id}
              showHolidays={calendar.showHolidays || false}
              handleHolidaysToggle={handleHolidaysToggle}
              handleNewEvent={handleNewEvent}
              openSleepScheduleDialog={() => setIsSleepScheduleDialogOpen(true)}
            />
          </div>
          
          {viewMode === 'day' && (
            <DayPreviewBar 
              selectedDate={currentDate}
              onSelectDate={(date) => {
                setCurrentDate(date);
                setSelectedDate(date);
              }}
            />
          )}
          
          {viewMode === 'month' ? (
            <MonthlyCalendar
              currentDate={currentDate}
              events={events}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          ) : (
            <DailyCalendarView
              selectedDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
            />
          )}
        </div>
        
        <EventSidebar 
          selectedDate={selectedDate}
          selectedDateEvents={selectedDateEvents}
          handleNewEvent={handleNewEvent}
          handleEventClick={handleEventClick}
        />
      </div>
      
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

export default CalendarView;
