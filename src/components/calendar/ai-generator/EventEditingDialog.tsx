
import React from 'react';
import { Event } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import EventForm from '@/components/EventForm';

interface EventEditingDialogProps {
  editingEvent: { event: Event; index: number } | null;
  setEditingEvent: (event: { event: Event; index: number } | null) => void;
  onUpdateEvent: (updatedEvent: Omit<Event, 'id' | 'calendarId'>) => void;
}

/**
 * Dialog component for editing AI-generated events
 * Provides a form interface using the shared EventForm component
 */
const EventEditingDialog: React.FC<EventEditingDialogProps> = ({
  editingEvent,
  setEditingEvent,
  onUpdateEvent
}) => {
  // Handle form submission from the EventForm
  const handleSubmit = (data: Omit<Event, 'id' | 'calendarId'>) => {
    onUpdateEvent(data);
  };
  
  // Handle dialog close
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingEvent(null);
    }
  };

  return (
    <Dialog 
      open={editingEvent !== null} 
      onOpenChange={handleDialogChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Make changes to your AI-generated event details.
          </DialogDescription>
        </DialogHeader>
        
        {editingEvent && (
          <EventForm
            initialValues={editingEvent.event}
            onSubmit={handleSubmit}
            onCancel={() => setEditingEvent(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventEditingDialog;
