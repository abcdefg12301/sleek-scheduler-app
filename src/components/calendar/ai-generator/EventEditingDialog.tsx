
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
    // Ensure proper date handling before updating
    try {
      // Make sure we have valid date objects
      const updatedData = {
        ...data,
        start: data.start instanceof Date ? data.start : new Date(data.start),
        end: data.end instanceof Date ? data.end : new Date(data.end),
      };
      
      // Preserve timezone information if it exists
      const preserveTimezoneInformation = (original: Date, updated: Date): Date => {
        // This function would ensure timezone information is properly preserved
        // For now, we'll just use the updated date
        return updated;
      };
      
      // Process dates to ensure we don't lose timezone information
      if (editingEvent) {
        const originalStart = editingEvent.event.start instanceof Date ? 
          editingEvent.event.start : new Date(editingEvent.event.start);
        const originalEnd = editingEvent.event.end instanceof Date ? 
          editingEvent.event.end : new Date(editingEvent.event.end);
          
        updatedData.start = preserveTimezoneInformation(originalStart, updatedData.start);
        updatedData.end = preserveTimezoneInformation(originalEnd, updatedData.end);
      }
      
      onUpdateEvent(updatedData);
    } catch (error) {
      console.error('Error processing dates in event update:', error, data);
      // Still try to update with original data
      onUpdateEvent(data);
    }
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
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
