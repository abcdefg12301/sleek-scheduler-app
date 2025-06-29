
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Event } from '@/types';
import { useCalendarStore } from '@/store/calendar-store';
import CalendarViewContent from '@/components/calendar/CalendarViewContent';
import CalendarHeader from '@/components/calendar/CalendarViewHeader';
import { useDateNavigation } from './hooks/useDateNavigation';
import { useEventDialogs } from './hooks/useEventDialogs';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useCalendarOperations } from './hooks/useCalendarOperations';

type CalendarViewType = 'day' | 'month';

const CalendarView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { calendars, initializeStore, isInitialized, deleteRecurringEvent } = useCalendarStore();
  
  const [viewMode, setViewMode] = React.useState<CalendarViewType>('month');
  
  // Initialize store on component mount
  React.useEffect(() => {
    if (!isInitialized) {
      initializeStore().catch(error => {
        console.error('Failed to initialize calendar store:', error);
      });
    }
  }, [isInitialized, initializeStore]);
  
  // Use custom hooks for date navigation, event dialogs and event fetching
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
  
  const { events, selectedDateEvents } = useCalendarEvents(
    id,
    calendars, 
    currentDate, 
    selectedDate,
    viewMode
  );

  const {
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleHolidaysToggle
  } = useCalendarOperations(id || '');
  
  const calendar = calendars.find(cal => cal.id === id);
  
  React.useEffect(() => {
    if (!calendar && id && isInitialized) {
      console.error('Calendar not found with ID:', id);
      navigate('/');
    }
  }, [id, calendar, navigate, isInitialized]);
  
  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading calendar...</p>
        </div>
      </div>
    );
  }
  
  if (!calendar || !id) {
    return null;
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
    setIsEditMode(false);
  };

  const onCreateEvent = async (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    const success = await handleCreateEvent(eventData);
    if (success) {
      setIsNewEventDialogOpen(false);
    }
  };

  const onUpdateEvent = async (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    if (!selectedEvent) return;
    const success = await handleUpdateEvent(selectedEvent.id, eventData);
    if (success) {
      setIsViewEventDialogOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null);
    }
  };

  const onDeleteEvent = async () => {
    if (!selectedEvent) return;
    const success = await handleDeleteEvent(selectedEvent.id);
    if (success) {
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const onDeleteRecurringEvent = async (mode: 'single' | 'future' | 'all') => {
    if (!selectedEvent) return;
    
    try {
      await deleteRecurringEvent(id, selectedEvent.id, mode, new Date(selectedEvent.start));
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete recurring event:', error);
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
        onDayHover={() => {}} // Empty function since we removed hover feature
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
