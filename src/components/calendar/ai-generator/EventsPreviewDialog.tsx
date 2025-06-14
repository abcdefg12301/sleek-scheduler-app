import React from 'react';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import AIGeneratedEventsList from '../AIGeneratedEventsList';

interface EventsPreviewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  events: Event[];
  onDeleteEvent: (index: number) => void;
  onEditEvent: (event: Event, index: number) => void;
  clearAllEvents: () => void;
}

const EventsPreviewDialog: React.FC<EventsPreviewDialogProps> = ({
  isOpen,
  setIsOpen,
  events,
  onDeleteEvent,
  onEditEvent,
  clearAllEvents
}) => {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-2">
            <DialogTitle>Generated Events</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="flex-1 overflow-hidden py-2">
            <AIGeneratedEventsList 
              events={events} 
              onDeleteEvent={onDeleteEvent}
              onEditEvent={onEditEvent}
            />
          </div>
          <Separator className="my-2" />
          <div className="flex justify-end pt-2">
            {events.length > 0 && (
              <Button 
                variant="outline" 
                onClick={clearAllEvents} 
                className="mr-2"
              >
                Clear All
              </Button>
            )}
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventsPreviewDialog;
