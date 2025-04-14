
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Event } from '@/types';
import { useCalendarStore } from '@/store/calendar-store';
import { toast } from 'sonner';
import CalendarViewContent from '@/components/calendar/CalendarViewContent';
import CalendarHeader from '@/components/calendar/CalendarViewHeader';
import { useDateNavigation } from './hooks/useDateNavigation';
import { useEventDialogs } from './hooks/useEventDialogs';

type CalendarViewType = 'day' | 'month';

const CalendarView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    calendars, 
    getEventsForDateRange,
    getEventsForDate,
    updateCalendar
  } = useCalendarStore();
  
  const [viewMode, setViewMode] = useState<CalendarViewType>('month');
  const [events, setEvents] = useState<Event[]>([]);
  
  // Use custom hooks for date navigation and event dialogs
  const { 
    currentDate,
    selectedDate,
    setSelectedDate,
    handlePrevPeriod,
    handleNextPeriod,
    handleTodayClick,
    handleDateSelect
  } = useDateNavigation(viewMode);

  const {
    isNewEventDialogOpen,
    setIsNewEventDialogOpen,
    isViewEventDialogOpen,
    setIsViewEventDialogOpen,
    selectedEvent,
    setSelectedEvent,
    isEditMode,
    setIsEditMode
  } = useEventDialogs();
  
  const calendar = calendars.find(cal => cal.id === id);
  
  // Fetch calendar events
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
  }, [calendar, id, currentDate, viewMode, calendars, getEventsForDateRange]);
  
  useEffect(() => {
    if (!calendar && id) {
      console.error('Calendar not found with ID:', id);
      navigate('/');
    }
  }, [id, calendar, navigate]);
  
  if (!calendar || !id) {
    return null;
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
    setIsEditMode(false);
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

  const handleHolidaysToggle = (enabled: boolean) => {
    try {
      updateCalendar(calendar.id, { showHolidays: enabled });
      toast.success(enabled ? 'Holidays enabled' : 'Holidays disabled');
    } catch (error) {
      console.error('Failed to update holiday settings:', error);
      toast.error('Failed to update settings');
    }
  };
  
  return (
    <div className="container py-8 animate-fade-in">
      <CalendarHeader 
        calendar={calendar}
        currentDate={currentDate}
        viewMode={viewMode}
        setViewMode={(mode: CalendarViewType) => setViewMode(mode)}
        handlePrevPeriod={handlePrevPeriod}
        handleNextPeriod={handleNextPeriod}
        handleTodayClick={handleTodayClick}
        handleNewEvent={() => setIsNewEventDialogOpen(true)}
        handleHolidaysToggle={handleHolidaysToggle}
        navigate={navigate}
      />
      
      <CalendarViewContent 
        calendar={calendar}
        viewMode={viewMode}
        currentDate={currentDate}
        selectedDate={selectedDate}
        events={events}
        selectedDateEvents={selectedDateEvents}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        handleNewEvent={() => setIsNewEventDialogOpen(true)}
        isNewEventDialogOpen={isNewEventDialogOpen}
        setIsNewEventDialogOpen={setIsNewEventDialogOpen}
        isViewEventDialogOpen={isViewEventDialogOpen}
        setIsViewEventDialogOpen={setIsViewEventDialogOpen}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      />
    </div>
  );
};

export default CalendarView;
