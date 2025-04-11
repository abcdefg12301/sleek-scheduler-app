
import React from 'react';
import { format } from 'date-fns';
import { Event, SleepSchedule } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import EventForm from '@/components/EventForm';
import SleepScheduleForm from '@/components/SleepScheduleForm';

interface EventDialogsProps {
  isNewEventDialogOpen: boolean;
  setIsNewEventDialogOpen: (open: boolean) => void;
  isViewEventDialogOpen: boolean;
  setIsViewEventDialogOpen: (open: boolean) => void;
  selectedEvent: Event | null;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  selectedDate: Date;
  handleCreateEvent: (data: Omit<Event, 'id' | 'calendarId'>) => void;
  handleUpdateEvent: (data: Omit<Event, 'id' | 'calendarId'>) => void;
  handleDeleteEvent: () => void;
  isSleepScheduleDialogOpen: boolean;
  setIsSleepScheduleDialogOpen: (open: boolean) => void;
  sleepSchedule?: SleepSchedule;
  handleSleepScheduleUpdate: (schedule: SleepSchedule) => void;
}

const EventDialogs = ({
  isNewEventDialogOpen,
  setIsNewEventDialogOpen,
  isViewEventDialogOpen,
  setIsViewEventDialogOpen,
  selectedEvent,
  isEditMode,
  setIsEditMode,
  selectedDate,
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
  isSleepScheduleDialogOpen,
  setIsSleepScheduleDialogOpen,
  sleepSchedule,
  handleSleepScheduleUpdate
}: EventDialogsProps) => {
  return (
    <>
      <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <EventForm 
            initialValues={{ 
              start: selectedDate, 
              end: new Date(new Date(selectedDate).setHours(selectedDate.getHours() + 1)) 
            }}
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
            initialValues={sleepSchedule || { enabled: false, startTime: '22:00', endTime: '06:00' }}
            onSubmit={handleSleepScheduleUpdate}
            onCancel={() => setIsSleepScheduleDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventDialogs;
