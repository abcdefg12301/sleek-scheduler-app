
import React from 'react';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import AIGeneratedEventsList from '../AIGeneratedEventsList';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventsPreviewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  events: Event[];
  onDeleteEvent: (index: number) => void;
  onEditEvent?: (event: Event, index: number) => void;
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
  // For debugging -- ensure we're seeing correct events
  React.useEffect(() => {
    console.log("[Preview Dialog] events.length =", events.length, events);
  }, [events, isOpen]);

  if (!isOpen || events.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle>Generated Events ({events.length})</DialogTitle>
        </DialogHeader>
        <Separator />
        <ScrollArea className="flex-1 min-h-[250px] max-h-[60vh] rounded-md p-0 overflow-y-auto">
          <div className="py-2 pr-1">
            <AIGeneratedEventsList 
              events={events} 
              onDeleteEvent={onDeleteEvent}
              onEditEvent={onEditEvent}
            />
          </div>
        </ScrollArea>
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
  );
};

export default EventsPreviewDialog;

