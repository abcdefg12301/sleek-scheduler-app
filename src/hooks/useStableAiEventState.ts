
import { useEffect, useRef, useState } from "react";
import { Event } from "@/types";

/**
 * AI Event State Hook - Fixed to properly isolate events by calendar
 */
export function useStableAiEventState({
  calendarId,
  initialEvents = [],
}: {
  calendarId?: string;
  initialEvents?: Event[];
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const lastInitRef = useRef<Event[]>([]);
  const currentCalendarRef = useRef<string | undefined>(calendarId);

  useEffect(() => {
    // Reset events when switching calendars
    if (currentCalendarRef.current !== calendarId) {
      currentCalendarRef.current = calendarId;
      setEvents(initialEvents);
      lastInitRef.current = initialEvents;
      return;
    }

    // Only sync if initialEvents has actually changed
    if (
      initialEvents.length !== lastInitRef.current.length ||
      initialEvents.some((e, i) => e.id !== lastInitRef.current[i]?.id)
    ) {
      // Filter events to only include those for this calendar
      const filteredEvents = initialEvents.filter(e => 
        !e.calendarId || e.calendarId === calendarId
      );
      setEvents(filteredEvents);
      lastInitRef.current = filteredEvents;
    }
  }, [calendarId, initialEvents]);

  function deleteEvent(index: number) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }

  function clearEvents() {
    setEvents([]);
  }

  function setEventsWithCalendarId(newEvents: Event[]) {
    // Ensure all events have the correct calendar ID
    const eventsWithCalendarId = newEvents.map(event => ({
      ...event,
      calendarId: calendarId || event.calendarId || '',
    }));
    setEvents(eventsWithCalendarId);
  }

  return {
    events,
    setEvents: setEventsWithCalendarId,
    deleteEvent,
    clearEvents,
  };
}
