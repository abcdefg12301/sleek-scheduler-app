import { useEffect, useRef, useState } from "react";
import { Event } from "@/types";

/**
 * AI Event State Hook
 * - Isolates AI events on a per-calendar basis, including unsaved (previewed) and saved events.
 * - Handles both new calendar (no id yet) and edit calendar (has id).
 * - Always starts from initialEvents provided at mount, but user actions only update local state until explicitly saved/cleared.
 */
export function useStableAiEventState({
  calendarId,
  initialEvents = [],
}: {
  calendarId?: string;
  initialEvents?: Event[];
}) {
  // Use local state for preview/temporary AI events. These should not affect other calendars.
  const [events, setEvents] = useState<Event[]>(initialEvents);
  // Keep a stable ref to initial events to support resync only when actual initialEvents changes.
  const lastInitRef = useRef<Event[]>(initialEvents);

  useEffect(() => {
    // Only sync if initialEvents has actually changed (not local state user edits)
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
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }
  function clearEvents() {
    // Only clear for the CURRENT calendar
    setEvents([]);
  }

  return {
    events,
    setEvents,
    deleteEvent,
    clearEvents,
  };
}
