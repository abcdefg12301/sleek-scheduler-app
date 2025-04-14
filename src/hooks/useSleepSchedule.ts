
import { useState } from 'react';
import { toast } from 'sonner';

// This is just a stub that doesn't do anything now that sleep functionality is removed
export function useSleepSchedule() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
