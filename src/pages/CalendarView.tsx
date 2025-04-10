
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addMonths, subMonths, parseISO, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar-store';
import { Event } from '@/types';
import CalendarHeader from '@/components/CalendarHeader';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import EventDisplay from '@/components/EventDisplay';
import EventForm from '@/components/EventForm';
import { toast } from 'sonner';

const CalendarView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { calendars, addEvent, updateEvent, deleteEvent } = useCalendarStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const calendar = calendars.find(cal => cal.id === id);
  
  if (!calendar) {
    navigate('/');
    return null;
  }
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleTodayClick = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  const handleNewEvent = () => {
    setIsNewEventDialogOpen(true);
  };
  
  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    if (id) {
      addEvent(id, eventData);
      setIsNewEventDialogOpen(false);
      toast.success('Event created successfully');
    }
  };
  
  const handleUpdateEvent = (eventData: Omit<Event, 'id' | 'calendarId'>) => {
    if (id && selectedEvent) {
      updateEvent(id, selectedEvent.id, eventData);
      setIsViewEventDialogOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      toast.success('Event updated successfully');
    }
  };
  
  const handleDeleteEvent = () => {
    if (id && selectedEvent) {
      deleteEvent(id, selectedEvent.id);
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Event deleted successfully');
    }
  };
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
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
  });
  
  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-2xl font-bold">
              <span 
                className="inline-block w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: calendar.color }}
              />
              {calendar.name}
            </h1>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`/edit-calendar/${id}`)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button onClick={handleNewEvent}>
                <Plus className="mr-2 h-4 w-4" /> Event
              </Button>
            </div>
          </div>
          
          <CalendarHeader
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleTodayClick}
          />
          
          <MonthlyCalendar
            currentDate={currentDate}
            events={events}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
          />
        </div>
        
        <div className="lg:w-1/4 bg-muted/20 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <Button size="sm" variant="outline" onClick={handleNewEvent}>
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          
          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events for this day
            </div>
          ) : (
            <div>
              {selectedDateEvents.map((event) => (
                <EventDisplay
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <EventForm 
            initialValues={{ start: selectedDate, end: selectedDate }}
            onSubmit={handleCreateEvent}
            onCancel={() => setIsNewEventDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Event' : 'Event Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && isEditMode ? (
            <EventForm 
              initialValues={selectedEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => setIsEditMode(false)}
            />
          ) : selectedEvent ? (
            <div>
              <h3 className="text-xl font-medium mb-2">{selectedEvent.title}</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                  <p>
                    {format(new Date(selectedEvent.start), selectedEvent.allDay ? 'PPP' : 'PPP p')}
                    {' '} - {' '}
                    {format(new Date(selectedEvent.end), selectedEvent.allDay ? 'PPP' : 'PPP p')}
                  </p>
                </div>
                
                {selectedEvent.location && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p>{selectedEvent.location}</p>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsViewEventDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" className="text-destructive" onClick={handleDeleteEvent}>
                  Delete
                </Button>
                <Button onClick={() => setIsEditMode(true)}>
                  Edit
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
