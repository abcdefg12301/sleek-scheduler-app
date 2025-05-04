
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Event } from '@/types';
import EventForm from '@/components/EventForm';
import EventDetails from './EventDetails';
import RecurringEventDeleteDialog from './RecurringEventDeleteDialog';

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
}: EventDialogsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Handle delete recurring event
  const handleDeleteClick = () => {
    if (selectedEvent?.recurrence || selectedEvent?.isRecurrenceInstance) {
      setIsDeleteDialogOpen(true);
    } else {
      handleDeleteEvent();
    }
  };

  // Handlers for the recurring event delete dialog
  const handleDeleteSingle = () => {
    if (!selectedEvent) return;
    
    // We'll implement this in our parent component
    handleDeleteEvent();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      {/* New Event Dialog */}
      <Dialog 
        open={isNewEventDialogOpen} 
        onOpenChange={setIsNewEventDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>
          <EventForm 
            initialValues={{
              start: selectedDate,
              end: new Date(selectedDate.getTime() + 60 * 60 * 1000),
            }}
            onSubmit={handleCreateEvent}
            onCancel={() => setIsNewEventDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* View/Edit Event Dialog */}
      <Dialog 
        open={isViewEventDialogOpen} 
        onOpenChange={setIsViewEventDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Event' : 'Event Details'}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <>
              {isEditMode ? (
                <EventForm 
                  initialValues={selectedEvent}
                  onSubmit={handleUpdateEvent}
                  onCancel={() => setIsEditMode(false)}
                />
              ) : (
                <EventDetails 
                  event={selectedEvent}
                  onEdit={() => setIsEditMode(true)}
                  onDelete={handleDeleteClick}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Recurring Event Delete Dialog */}
      {selectedEvent && (
        <RecurringEventDeleteDialog 
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDeleteSingle={handleDeleteSingle}
          onDeleteAllFuture={() => {
            if (!selectedEvent) return;
            // We'll implement these in our parent component
            handleDeleteEvent();
            setIsDeleteDialogOpen(false);
          }}
          onDeleteAll={() => {
            if (!selectedEvent) return;
            handleDeleteEvent();
            setIsDeleteDialogOpen(false);
          }}
          eventTitle={selectedEvent.title}
          eventDate={selectedEvent.start instanceof Date ? selectedEvent.start : new Date(selectedEvent.start)}
        />
      )}
    </>
  );
};

export default EventDialogs;
