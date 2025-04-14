
// This hook is empty as we've removed sleep schedule functionality
import { useState } from 'react';
import { toast } from 'sonner';

export function useSleepSchedule() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Just a no-op placeholder for the removed sleep schedule feature
  const openDialog = () => {
    toast.info('Sleep schedule functionality has been removed');
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
  };
  
  return {
    isDialogOpen,
    isLoading,
    openDialog,
    closeDialog,
  };
}
