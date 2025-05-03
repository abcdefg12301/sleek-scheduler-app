
import React from 'react';
import { Event } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/components/EventForm';

interface EventEditingDialogProps {
  editingEvent: { event: Event; index: number } | null;
  setEditingEvent: (event: { event: Event; index: number } | null) => void;
  onUpdateEvent: (updatedEvent: Omit<Event, 'id' | 'calendarId'>) => void;
}

const EventEditingDialog: React.FC<EventEditingDialogProps> = ({
  editingEvent,
  setEditingEvent,
  onUpdateEvent
}) => {
  return (
    <Dialog 
      open={editingEvent !== null} 
      onOpenChange={(open) => !open && setEditingEvent(null)}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        {editingEvent && (
          <EventForm
            initialValues={editingEvent.event}
            onSubmit={onUpdateEvent}
            onCancel={() => setEditingEvent(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventEditingDialog;
