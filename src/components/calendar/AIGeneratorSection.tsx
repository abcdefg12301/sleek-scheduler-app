
import React, { useCallback } from "react";
import AICalendarGenerator from "./AICalendarGenerator";
import AIPreviewSection from "./AIPreviewSection";
import { Event } from "@/types";
import { useAIPreviewDialog } from "@/hooks/useAIPreviewDialog";

// Helper for merging existing and preview AI events for context
function getFullEventContext(currentEvents: Event[], previewedAiEvents: Event[], calendarId?: string): Event[] {
  // Filter events by calendar ID to prevent cross-calendar contamination
  const filteredCurrentEvents = currentEvents.filter(e => 
    !calendarId || e.calendarId === calendarId
  );
  const filteredPreviewEvents = previewedAiEvents.filter(e => 
    !calendarId || !e.calendarId || e.calendarId === calendarId
  );
  
  const all = [...filteredCurrentEvents, ...filteredPreviewEvents];
  const byId = new Map();
  all.forEach(ev => {
    if (ev.id) byId.set(ev.id, ev);
  });
  return Array.from(byId.values());
}

interface AIGeneratorSectionProps {
  aiEvents: Event[];
  setAiEvents: (events: Event[]) => void;
  deleteAiEvent: (index: number) => void;
  clearAllEvents: () => void;
  calendarId?: string;
  calendarColor?: string;
  currentEvents?: Event[];
}

const AIGeneratorSection: React.FC<AIGeneratorSectionProps> = ({
  aiEvents,
  setAiEvents,
  deleteAiEvent,
  clearAllEvents,
  calendarId,
  calendarColor,
  currentEvents = [],
}) => {
  const { isPreviewOpen, openPreview, setIsPreviewOpen } = useAIPreviewDialog(false);

  const onEventsGenerated = useCallback(
    (events: Event[]) => {
      // Filter out events that already exist in aiEvents to prevent duplicates
      const filteredEvents = events.filter(e =>
        !aiEvents.some(ev =>
          ev.title === e.title &&
          new Date(ev.start).getTime() === new Date(e.start).getTime() &&
          new Date(ev.end).getTime() === new Date(e.end).getTime()
        )
      );
      
      // Ensure all new events have the correct calendar ID
      const eventsWithCalendarId = filteredEvents.map(event => ({
        ...event,
        calendarId: calendarId || '',
      }));
      
      // Append to existing aiEvents instead of replacing
      const newEvents = [...aiEvents, ...eventsWithCalendarId];
      setAiEvents(newEvents);
      openPreview();
    },
    [setAiEvents, openPreview, aiEvents, calendarId]
  );

  const allEventContext = getFullEventContext(currentEvents, aiEvents, calendarId);

  return (
    <div>
      <AICalendarGenerator
        standalone={false}
        calendarId={calendarId}
        existingEvents={allEventContext}
        onEventsGenerated={onEventsGenerated}
        onPreviewOpen={openPreview}
        calendarColor={calendarColor}
      />
      {aiEvents && aiEvents.length > 0 && (
        <AIPreviewSection
          aiEvents={aiEvents}
          isOpen={isPreviewOpen}
          setIsOpen={setIsPreviewOpen}
          onDeleteEvent={deleteAiEvent}
          clearAllEvents={clearAllEvents}
          setAiEvents={setAiEvents}
        />
      )}
    </div>
  );
};

export default AIGeneratorSection;
