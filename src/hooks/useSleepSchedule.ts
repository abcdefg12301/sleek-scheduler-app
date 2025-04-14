
import { useState } from 'react';
import { SleepSchedule } from '@/types';
import { toast } from 'sonner';

export function useSleepSchedule() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const openDialog = () => {
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
  };
  
  const updateSchedule = async (
    calendarId: string, 
    schedule: SleepSchedule, 
    updateFn: (id: string, schedule: SleepSchedule) => void
  ) => {
    setIsLoading(true);
    try {
      await updateFn(calendarId, schedule);
      toast.success('Sleep schedule updated');
      closeDialog();
    } catch (error) {
      console.error('Failed to update sleep schedule:', error);
      toast.error('Failed to update sleep schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isDialogOpen,
    isLoading,
    openDialog,
    closeDialog,
    updateSchedule
  };
}
