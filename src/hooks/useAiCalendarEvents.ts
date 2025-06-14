
import { useState, useEffect } from "react";
import { Event } from "@/types";

interface UseAiCalendarEventsOptions {
  calendarId?: string;
  initialEvents?: Event[];
}

/**
 * Centralizes AI event state management, ensuring calendar isolation and sync across pages.
 */
export function useAiCalendarEvents({ calendarId, initialEvents = [] }: UseAiCalendarEventsOptions) {
  const [aiEvents, setAiEvents] = useState<Event[]>(initialEvents);

  // Resync when base data or calendar changes
  useEffect(() => {
    setAiEvents(initialEvents);
  }, [initialEvents, calendarId]);

  // Add/replace all events
  function setGeneratedEvents(events: Event[]) {
    setAiEvents(events);
  }

  // Remove event by index
  function deleteEvent(index: number) {
    setAiEvents(prev =>
      prev.filter((_, i) => i !== index)
    );
  }

  // Clear all
  function clearAllEvents() {
    setAiEvents([]);
  }

  return {
    aiEvents,
    setGeneratedEvents,
    deleteEvent,
    clearAllEvents,
  };
}
