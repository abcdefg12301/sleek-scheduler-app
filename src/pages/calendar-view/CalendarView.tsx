
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Event } from '@/types';
import { useCalendarStore } from '@/store/calendar-store';
import { toast } from 'sonner';
import CalendarViewContent from '@/components/calendar/CalendarViewContent';
import CalendarHeader from '@/components/calendar/CalendarViewHeader';
import { useDateNavigation } from './hooks/useDateNavigation';
import { useEventDialogs } from './hooks/useEventDialogs';
import { useCalendarEvents } from './hooks/useCalendarEvents';

type CalendarViewType = 'day' | 'month';

const CalendarView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { calendars, updateCalendar } = useCalendarStore();
  
  const [viewMode, setViewMode] = React.useState<CalendarViewType>('month');
  
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
  
  const calendar = calendars.find(cal => cal.id === id);
  
  React.useEffect(() => {
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
      />
    </div>
  );
};

export default CalendarView;
