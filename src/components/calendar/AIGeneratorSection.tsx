
import React, { useCallback } from "react";
import AICalendarGenerator from "./AICalendarGenerator";
import AIPreviewSection from "./AIPreviewSection";
import { Event } from "@/types";
import { useAIPreviewDialog } from "@/hooks/useAIPreviewDialog";

// Extracted logic for enhanced modularity and testing
// Helper for merging existing and preview AI events for context
function getFullEventContext(currentEvents: Event[], previewedAiEvents: Event[]): Event[] {
  // Merge, deduplicate by id if present, return full event array for context
  const all = [...(currentEvents || []), ...(previewedAiEvents || [])];
  // De-duplication if event IDs exist
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
  currentEvents?: Event[]; // Real events from calendar (for full context/prevent AI conflicts)
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
      setAiEvents(events);
      openPreview();
    },
    [setAiEvents, openPreview]
  );

  // Merge true existing DB events and current AI events for conflict context
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
