
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addMonths, subMonths, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { Event, SleepSchedule } from '@/types';
import { useCalendarStore } from '@/store/calendar-store';
import { toast } from 'sonner';
import CalendarViewContent from '@/components/calendar/CalendarViewContent';
import CalendarHeader from '@/components/calendar/CalendarViewHeader';

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
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
    setIsEditMode(false);
  };

  // Add the missing handleHolidaysToggle function
  const handleHolidaysToggle = (enabled: boolean) => {
    try {
      updateCalendar(calendar.id, { showHolidays: enabled });
      toast.success(enabled ? 'Holidays enabled' : 'Holidays disabled');
    } catch (error) {
      console.error('Failed to update holiday settings:', error);
      toast.error('Failed to update settings');
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
  
  return (
    <div className="container py-8 animate-fade-in">
      <CalendarHeader 
        calendar={calendar}
        currentDate={currentDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handlePrevPeriod={handlePrevPeriod}
        handleNextPeriod={handleNextPeriod}
        handleTodayClick={handleTodayClick}
        handleNewEvent={() => setIsNewEventDialogOpen(true)}
        handleHolidaysToggle={handleHolidaysToggle}
        setIsSleepScheduleDialogOpen={setIsSleepScheduleDialogOpen}
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
        isSleepScheduleDialogOpen={isSleepScheduleDialogOpen}
        setIsSleepScheduleDialogOpen={setIsSleepScheduleDialogOpen}
      />
    </div>
  );
};

export default CalendarView;
