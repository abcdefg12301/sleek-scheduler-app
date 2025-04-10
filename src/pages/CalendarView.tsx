
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Settings, Calendar as CalendarIcon, Flag } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar-store';
import { Event, SleepSchedule } from '@/types';
import CalendarHeader from '@/components/CalendarHeader';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import DailyCalendarView from '@/components/DailyCalendarView';
import WeeklyCalendarView from '@/components/WeeklyCalendarView';
import CalendarViewSelector from '@/components/CalendarViewSelector';
import EventDisplay from '@/components/EventDisplay';
import EventForm from '@/components/EventForm';
import SleepScheduleForm from '@/components/SleepScheduleForm';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type CalendarViewType = 'day' | 'week' | 'month';

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
    switch (viewMode) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };
  
  const handleNextPeriod = () => {
    console.log('Navigating to next period in', viewMode, 'view');
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };
  
  const handleDateSelect = (date: Date) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
  };
  
  const handleTodayClick = () => {
    console.log('Navigating to today');
    setCurrentDate(new Date());
    setSelectedDate(new Date());
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
  
  const renderCalendarView = () => {
    console.log('Rendering calendar view in', viewMode, 'mode');
    switch (viewMode) {
      case 'day':
        return (
          <DailyCalendarView
            selectedDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
          />
        );
      case 'week':
        return (
          <WeeklyCalendarView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
          />
        );
      case 'month':
      default:
        return (
          <MonthlyCalendar
            currentDate={currentDate}
            events={events}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
          />
        );
    }
  };
  
  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold flex-grow text-center">
              <span 
                className="inline-block w-3 h-3 md:w-4 md:h-4 rounded-full mr-2"
                style={{ backgroundColor: calendar.color }}
              />
              {calendar.name}
            </h1>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Calendar Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate(`/edit-calendar/${id}`)}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Edit Calendar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsSleepScheduleDialogOpen(true)}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Sleep Schedule</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Flag className="mr-2 h-4 w-4" />
                          <span>Show Holidays</span>
                        </div>
                        <Switch 
                          checked={calendar.showHolidays || false} 
                          onCheckedChange={handleHolidaysToggle}
                        />
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={handleNewEvent}>
                <Plus className="mr-2 h-4 w-4" /> Event
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2 mb-6">
            <CalendarHeader
              currentDate={currentDate}
              onPrevMonth={handlePrevPeriod}
              onNextMonth={handleNextPeriod}
              onToday={handleTodayClick}
              viewMode={viewMode}
            />
            
            <CalendarViewSelector 
              currentView={viewMode}
              onChange={setViewMode}
            />
          </div>
          
          {renderCalendarView()}
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
      
      <Dialog open={isSleepScheduleDialogOpen} onOpenChange={setIsSleepScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sleep Schedule</DialogTitle>
            <DialogDescription>
              Set your sleep schedule to automatically add sleep events to your calendar.
            </DialogDescription>
          </DialogHeader>
          <SleepScheduleForm
            initialValues={calendar.sleepSchedule || { enabled: false, startTime: '22:00', endTime: '06:00' }}
            onSubmit={handleSleepScheduleUpdate}
            onCancel={() => setIsSleepScheduleDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
