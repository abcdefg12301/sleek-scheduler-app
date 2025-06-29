import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addMonths, subMonths, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { Event } from '@/types';
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
    updateCalendar,
    addEvent,
    updateEvent,
    deleteEvent,
    deleteRecurringEvent
  } = useCalendarStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<CalendarViewType>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  
  const calendar = calendars.find(cal => cal.id === id);
  
  useEffect(() => {
    if (calendar) {
      console.log(`Current calendar: ${calendar.name} (${calendar.id})`);
      console.log(`Current view: ${viewMode}, Current date: ${currentDate.toISOString()}`);
    }
  }, [calendar, viewMode, currentDate]);
  
  useEffect(() => {
    if (!calendar || !id) return;
    
    const start = viewMode === 'day' 
      ? startOfDay(currentDate)
      : startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    
    const end = viewMode === 'day'
      ? endOfDay(currentDate)
      : endOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
    
    try {
      console.time('getEventsForDateRange');
      const allEvents = getEventsForDateRange(start, end);
      console.timeEnd('getEventsForDateRange');
      setEvents(allEvents);
      
      console.log(`Loaded ${allEvents.length} events for ${viewMode} view`);
      console.log(`Date range: ${start.toISOString()} to ${end.toISOString()}`);
    } catch (error) {
      console.error('Error loading events:', error);
    }
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
  
  const updateSelectedDateEvents = (date: Date) => {
    const isSameDay = (date1: Date, date2: Date) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };
    
    const dateEvents = events
      .filter(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        
        return (
          isSameDay(date, eventStart) || 
          isSameDay(date, eventEnd) ||
          (eventStart < date && eventEnd > date)
        );
      })
      .sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (b.allDay && !a.allDay) return 1;
        
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
      
    console.log(`Found ${dateEvents.length} events for ${date.toISOString()}`);
    setSelectedDateEvents(dateEvents);
  };
  
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
    console.log(`Date selected: ${date.toISOString()}`);
    setSelectedDate(date);
    
    if (viewMode === 'month') {
      setViewMode('day');
      setCurrentDate(date);
    } else {
      setCurrentDate(date);
    }
    
    setHoveredDate(null);
  };
  
  const handleDayHover = (date: Date) => {
    if (viewMode === 'month') {
      console.log(`Day hover: ${date.toISOString()}`);
      setHoveredDate(date);
    }
  };
  
  const handleTodayClick = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setHoveredDate(null);
  };
  
  const handleEventClick = (event: Event) => {
    console.log(`Event clicked: ${event.title}`);
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
    setIsEditMode(false);
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

  const onCreateEvent = async (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    try {
      await addEvent(id, eventData);
      toast.success('Event created successfully');
      setIsNewEventDialogOpen(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    }
  };

  const onUpdateEvent = async (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    if (!selectedEvent) return;
    try {
      await updateEvent(id, selectedEvent.id, eventData);
      toast.success('Event updated successfully');
      setIsViewEventDialogOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    }
  };

  const onDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      await deleteEvent(id, selectedEvent.id);
      toast.success('Event deleted successfully');
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  const onDeleteRecurringEvent = async (mode: 'single' | 'future' | 'all') => {
    if (!selectedEvent) return;
    try {
      await deleteRecurringEvent(id, selectedEvent.id, mode, new Date(selectedEvent.start));
      const actionText = mode === 'single' ? 'occurrence' : 
                        mode === 'future' ? 'future occurrences' : 
                        'all occurrences';
      toast.success(`Event ${actionText} deleted successfully`);
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete recurring event:', error);
      toast.error('Failed to delete event');
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
        selectedDate={hoveredDate || selectedDate}
        events={events}
        selectedDateEvents={selectedDateEvents}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        onDayHover={handleDayHover}
        handleNewEvent={() => setIsNewEventDialogOpen(true)}
        isNewEventDialogOpen={isNewEventDialogOpen}
        setIsNewEventDialogOpen={setIsNewEventDialogOpen}
        isViewEventDialogOpen={isViewEventDialogOpen}
        setIsViewEventDialogOpen={setIsViewEventDialogOpen}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        onCreateEvent={onCreateEvent}
        onUpdateEvent={onUpdateEvent}
        onDeleteEvent={onDeleteEvent}
        onDeleteRecurringEvent={onDeleteRecurringEvent}
      />
    </div>
  );
};

export default CalendarView;
