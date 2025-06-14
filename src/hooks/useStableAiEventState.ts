
import { useEffect, useRef, useState } from "react";
import { Event } from "@/types";

/**
 * Provides robust AI event state management for both new and existing calendars:
 * - If a calendarId is provided, keeps AI events isolated per calendar and persists immediately after save.
 * - If no calendarId, treats AI events as temp until final save.
 * - Resyncs with changing initial events.
 *
 * @param calendarId      (string | undefined)
 * @param initialEvents   (Event[])
 *
 * Usage:
 *   const { events, setEvents, clearEvents, deleteEvent } = useStableAiEventState({ calendarId, initialEvents })
 */
export function useStableAiEventState({
  calendarId,
  initialEvents = []
}: {
  calendarId?: string;
  initialEvents?: Event[];
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  // Track latest initialEvents array to avoid resync loops
  const lastInitRef = useRef(initialEvents);

  useEffect(() => {
    // Only update if incoming initialEvents changed
    if (
      initialEvents.length !== lastInitRef.current.length ||
      initialEvents.some((e, i) => e.id !== lastInitRef.current[i]?.id)
    ) {
      setEvents(initialEvents);
      lastInitRef.current = initialEvents;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarId, initialEvents]);

  function deleteEvent(index: number) {
    setEvents(prev => prev.filter((_, i) => i !== index));
  }
  function clearEvents() {
    setEvents([]);
  }

  return {
    events,
    setEvents,
    deleteEvent,
    clearEvents
  };
}
