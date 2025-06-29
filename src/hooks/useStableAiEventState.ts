
import { useEffect, useRef, useState } from "react";
import { Event } from "@/types";

/**
 * AI Event State Hook - Enhanced to properly isolate events by calendar
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
      // Filter events to only include those for this calendar - be more strict
      const filteredEvents = initialEvents.filter(e => {
        // If no calendarId specified, accept events without calendarId
        if (!calendarId) return !e.calendarId || e.calendarId === '';
        
        // If calendarId specified, only accept exact matches
        return e.calendarId === calendarId;
      });
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
    // Ensure all events have the correct calendar ID and filter out foreign events
    const eventsWithCalendarId = newEvents
      .filter(event => {
        // Only allow events that belong to this calendar or have no calendar assigned
        if (!calendarId) return !event.calendarId || event.calendarId === '';
        return !event.calendarId || event.calendarId === calendarId;
      })
      .map(event => ({
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
