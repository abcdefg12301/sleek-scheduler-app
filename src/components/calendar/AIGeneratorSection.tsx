import React, { useCallback } from "react";
import AICalendarGenerator from "./AICalendarGenerator";
import AIPreviewSection from "./AIPreviewSection";
import { Event } from "@/types";
import { useAIPreviewDialog } from "@/hooks/useAIPreviewDialog";

// Helper for merging existing and preview AI events for context
function getFullEventContext(currentEvents: Event[], previewedAiEvents: Event[]): Event[] {
  const all = [...(currentEvents || []), ...(previewedAiEvents || [])];
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
      // Only append events that aren't already present - append, not replace!
      const filteredEvents = events.filter(e =>
        !aiEvents.some(ev =>
          ev.title === e.title &&
          new Date(ev.start).getTime() === new Date(e.start).getTime() &&
          new Date(ev.end).getTime() === new Date(e.end).getTime()
        )
      );
      // Keep all previous aiEvents + new filtered (append)
      const newEvents = [...aiEvents, ...filteredEvents];
      setAiEvents(newEvents);
      openPreview();
    },
    [setAiEvents, openPreview, aiEvents]
  );

  const allEventContext = getFullEventContext(currentEvents, aiEvents);

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
        />
      )}
    </div>
  );
};

export default AIGeneratorSection;
