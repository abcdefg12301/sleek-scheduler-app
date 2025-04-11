
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addMonths, subMonths, addDays, subDays } from 'date-fns';
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
  console.log('Rendering CalendarView');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    calendars, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    updateCalendar, 
    updateSleepSchedule 
  } = useCalendarStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<CalendarViewType>('month');
  const [isSleepScheduleDialogOpen, setIsSleepScheduleDialogOpen] = useState(false);
  
  const calendar = calendars.find(cal => cal.id === id);
  
  useEffect(() => {
    console.log('Calendar view loaded with ID:', id);
    if (!calendar && id) {
      console.error('Calendar not found with ID:', id);
      navigate('/');
    }
  }, [id, calendar, navigate]);
  
  if (!calendar || !id) {
    return null;
  }
  
  const handlePrevPeriod = () => {
    console.log('Navigating to previous period in', viewMode, 'view');
    if (viewMode === 'day') {
      setCurrentDate(subDays(currentDate, 1));
      setSelectedDate(subDays(selectedDate, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };
  
  const handleNextPeriod = () => {
    console.log('Navigating to next period in', viewMode, 'view');
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1));
      setSelectedDate(addDays(selectedDate, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };
  
  const handleDateSelect = (date: Date) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
    
    // Switch to day view when clicking a day in month view
    if (viewMode === 'month') {
      setViewMode('day');
      setCurrentDate(date);
    }
  };
  
  const handleTodayClick = () => {
    console.log('Navigating to today');
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };
  
  const handleNewEvent = () => {
    console.log('Opening new event dialog');
    setIsNewEventDialogOpen(true);
  };
  
  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    console.log('Creating new event with data:', eventData);
    if (id) {
      addEvent(id, eventData);
      setIsNewEventDialogOpen(false);
      toast.success('Event created successfully');
    }
  };
  
  const handleUpdateEvent = (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    console.log('Updating event with data:', eventData);
    if (id && selectedEvent) {
      updateEvent(id, selectedEvent.id, eventData);
      setIsViewEventDialogOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      toast.success('Event updated successfully');
    }
  };
  
  const handleDeleteEvent = () => {
    console.log('Deleting event:', selectedEvent?.id);
    if (id && selectedEvent) {
      deleteEvent(id, selectedEvent.id);
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Event deleted successfully');
    }
  };
  
  const handleEventClick = (event: Event) => {
    console.log('Event clicked:', event);
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };
  
  const handleHolidaysToggle = (enabled: boolean) => {
    console.log('Holidays toggle:', enabled);
    if (id) {
      updateCalendar(id, { showHolidays: enabled });
      toast.success(enabled ? 'Holidays enabled' : 'Holidays disabled');
    }
  };
  
  const handleSleepScheduleUpdate = (sleepSchedule: SleepSchedule) => {
    console.log('Updating sleep schedule:', sleepSchedule);
    if (id) {
      updateSleepSchedule(id, sleepSchedule);
      setIsSleepScheduleDialogOpen(false);
      toast.success('Sleep schedule updated');
    }
  };
  
  const events = calendar.events;
  
  const selectedDateEvents = events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const compareDate = new Date(selectedDate);
    
    // Reset time components to compare dates only
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);
    
    return compareDate >= eventStart && compareDate <= eventEnd;
  }).sort((a, b) => {
    // Sort all-day events first
    if (a.allDay && !b.allDay) return -1;
    if (b.allDay && !a.allDay) return 1;
    
    // Sort by start time
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
  
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
