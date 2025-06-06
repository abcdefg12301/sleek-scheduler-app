
import React, { useState } from 'react';
import { Calendar, Event as CalendarEvent } from '@/types';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import DailyCalendarView from '@/components/DailyCalendarView';
import DayPreviewBar from '@/components/calendar/DayPreviewBar';
import EventSidebar from '@/components/calendar/EventSidebar';
import EventDialogs from '@/components/calendar/EventDialogs';
import { useCalendarStore } from '@/store/calendar-store';
import { toast } from 'sonner';
import RecurringEventDeleteDialog from './RecurringEventDeleteDialog';

type CalendarViewType = 'day' | 'month';

interface CalendarViewContentProps {
  calendar: Calendar;
  viewMode: CalendarViewType;
  currentDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  selectedDateEvents: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDayHover?: (date: Date) => void;
  handleNewEvent: () => void;
  isNewEventDialogOpen: boolean;
  setIsNewEventDialogOpen: (open: boolean) => void;
  isViewEventDialogOpen: boolean;
  setIsViewEventDialogOpen: (open: boolean) => void;
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
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
  onDayHover,
  handleNewEvent,
  isNewEventDialogOpen,
  setIsNewEventDialogOpen,
  isViewEventDialogOpen,
  setIsViewEventDialogOpen,
  selectedEvent,
  setSelectedEvent,
  isEditMode,
  setIsEditMode
}: CalendarViewContentProps) => {
  const { 
    addEvent,
    updateEvent,
    deleteEvent,
    deleteRecurringEvent,
    updateCalendar,
  } = useCalendarStore();

  const [isRecurringDeleteDialogOpen, setIsRecurringDeleteDialogOpen] = useState(false);

  const handleCreateEvent = (eventData: Omit<CalendarEvent, 'id' | 'calendarId'>) => {
    try {
      addEvent(calendar.id, eventData);
      setIsNewEventDialogOpen(false);
      toast.success('Event created successfully');
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    }
  };
  
  const handleUpdateEvent = (eventData: Omit<CalendarEvent, 'id' | 'calendarId'>) => {
    if (!selectedEvent) return;
    
    try {
      updateEvent(calendar.id, selectedEvent.id, eventData);
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
    
    // Check if it's a recurring event or a recurrence instance
    if ((selectedEvent.recurrence || selectedEvent.isRecurrenceInstance) && 
        !isRecurringDeleteDialogOpen) {
      setIsRecurringDeleteDialogOpen(true);
      return;
    }
    
    try {
      deleteEvent(calendar.id, selectedEvent.id);
      setIsViewEventDialogOpen(false);
      setIsRecurringDeleteDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleDeleteRecurringEvent = (mode: 'single' | 'future' | 'all') => {
    if (!selectedEvent) return;
    
    try {
      // Get the master event ID
      const eventId = selectedEvent.originalEventId || selectedEvent.id;
      
      // Delete based on mode
      deleteRecurringEvent(calendar.id, eventId, mode, selectedEvent.start instanceof Date ? 
        selectedEvent.start : new Date(selectedEvent.start));
      
      // Close all dialogs and clear selection
      setIsViewEventDialogOpen(false);
      setIsRecurringDeleteDialogOpen(false);
      setSelectedEvent(null);
      
      const actionText = mode === 'single' ? 'occurrence' : 
                        mode === 'future' ? 'future occurrences' : 
                        'all occurrences';
      
      toast.success(`Event ${actionText} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete recurring event:', error);
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

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-6">
      <div className="lg:flex-grow">
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
      />
      
      {/* Recurring Event Delete Dialog - Fixed to prevent double-click issue */}
      {selectedEvent && (
        <RecurringEventDeleteDialog 
          isOpen={isRecurringDeleteDialogOpen}
          onClose={() => {
            setIsRecurringDeleteDialogOpen(false);
          }}
          onDeleteSingle={() => {
            handleDeleteRecurringEvent('single');
          }}
          onDeleteAllFuture={() => {
            handleDeleteRecurringEvent('future');
          }}
          onDeleteAll={() => {
            handleDeleteRecurringEvent('all');
          }}
          eventTitle={selectedEvent.title}
          eventDate={selectedEvent.start instanceof Date ? selectedEvent.start : new Date(selectedEvent.start)}
        />
      )}
    </div>
  );
};

export default CalendarViewContent;
