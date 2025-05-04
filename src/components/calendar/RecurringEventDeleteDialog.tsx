
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RecurringEventDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteSingle: () => void;
  onDeleteAllFuture: () => void;
  onDeleteAll: () => void;
  eventTitle: string;
  eventDate: Date;
}

const RecurringEventDeleteDialog: React.FC<RecurringEventDeleteDialogProps> = ({
  isOpen,
  onClose,
  onDeleteSingle,
  onDeleteAllFuture,
  onDeleteAll,
  eventTitle,
  eventDate
}) => {
  const formattedDate = eventDate ? eventDate.toLocaleDateString() : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Recurring Event</DialogTitle>
          <DialogDescription>
            "{eventTitle}" is a recurring event. How would you like to delete it?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <Button
            variant="outline"
            className="justify-start text-left h-auto py-3"
            onClick={onDeleteSingle}
          >
            <div>
              <p className="font-medium">Delete this occurrence only</p>
              <p className="text-sm text-muted-foreground">
                Only the event on {formattedDate} will be deleted
              </p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start text-left h-auto py-3"
            onClick={onDeleteAllFuture}
          >
            <div>
              <p className="font-medium">Delete this and all future occurrences</p>
              <p className="text-sm text-muted-foreground">
                This event and all occurrences after {formattedDate} will be deleted
              </p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start text-left h-auto py-3"
            onClick={onDeleteAll}
          >
            <div>
              <p className="font-medium">Delete all occurrences</p>
              <p className="text-sm text-muted-foreground">
                The entire recurring event series will be deleted
              </p>
            </div>
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringEventDeleteDialog;
