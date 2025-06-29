
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
  // Event operation handlers
  onCreateEvent: (eventData: Omit<CalendarEvent, 'id' | 'calendarId'>) => Promise<void>;
  onUpdateEvent: (eventData: Omit<CalendarEvent, 'id' | 'calendarId'>) => Promise<void>;
  onDeleteEvent: () => Promise<void>;
  onDeleteRecurringEvent: (mode: 'single' | 'future' | 'all') => Promise<void>;
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
  setIsEditMode,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onDeleteRecurringEvent
}: CalendarViewContentProps) => {
  const [isRecurringDeleteDialogOpen, setIsRecurringDeleteDialogOpen] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  const handleCreateEvent = async (eventData: Omit<CalendarEvent, 'id' | 'calendarId'>) => {
    try {
      await onCreateEvent(eventData);
      setIsNewEventDialogOpen(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      // Error already handled by parent
    }
  };
  
  const handleUpdateEvent = async (eventData: Omit<CalendarEvent, 'id' | 'calendarId'>) => {
    try {
      await onUpdateEvent(eventData);
      setIsViewEventDialogOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to update event:', error);
      // Error already handled by parent
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!selectedEvent || isDeletingEvent) return;
    
    // Check if it's a recurring event or a recurrence instance
    if ((selectedEvent.recurrence || selectedEvent.isRecurrenceInstance) && 
        !isRecurringDeleteDialogOpen) {
      setIsRecurringDeleteDialogOpen(true);
      return;
    }
    
    setIsDeletingEvent(true);
    
    try {
      await onDeleteEvent();
      // Close all dialogs immediately after successful deletion
      setIsViewEventDialogOpen(false);
      setIsRecurringDeleteDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      // Error already handled by parent
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleDeleteRecurringEvent = async (mode: 'single' | 'future' | 'all') => {
    if (!selectedEvent || isDeletingEvent) return;
    
    setIsDeletingEvent(true);
    
    try {
      await onDeleteRecurringEvent(mode);
      
      // Close all dialogs immediately after successful deletion
      setIsViewEventDialogOpen(false);
      setIsRecurringDeleteDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete recurring event:', error);
      // Error already handled by parent
    } finally {
      setIsDeletingEvent(false);
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
