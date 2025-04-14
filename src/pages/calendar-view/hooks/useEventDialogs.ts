
import { useState } from 'react';
import { Event } from '@/types';

export const useEventDialogs = () => {
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  return {
    isNewEventDialogOpen,
    setIsNewEventDialogOpen,
    isViewEventDialogOpen,
    setIsViewEventDialogOpen,
    selectedEvent,
    setSelectedEvent,
    isEditMode,
    setIsEditMode
  };
};
