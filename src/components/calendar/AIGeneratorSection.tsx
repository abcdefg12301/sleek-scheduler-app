
import React from "react";
import AICalendarGenerator from "./AICalendarGenerator";
import AIPreviewSection from "./AIPreviewSection";
import { Event } from "@/types";
import { useAIPreviewDialog } from "@/hooks/useAIPreviewDialog";

/**
 * Main section giving preview+generation logic, always isolated per calendarId.
 */
interface AIGeneratorSectionProps {
  aiEvents: Event[];
  setAiEvents: (events: Event[]) => void;
  deleteAiEvent: (index: number) => void;
  clearAllEvents: () => void;
  calendarId?: string;
}

const AIGeneratorSection: React.FC<AIGeneratorSectionProps> = ({
  aiEvents,
  setAiEvents,
  deleteAiEvent,
  clearAllEvents,
  calendarId
}) => {
  const { isPreviewOpen, openPreview, setIsPreviewOpen } = useAIPreviewDialog(false);

  // Pass all existing AI events for the calendar both as source and as context to generator
  const onEventsGenerated = (events: Event[]) => {
    // Always replace with the newly generated list (preview mode)
    setAiEvents(events);
    openPreview();
  };

  return (
    <div>
      <AICalendarGenerator
        standalone={false}
        calendarId={calendarId}
        existingEvents={aiEvents}
        onEventsGenerated={onEventsGenerated}
        onPreviewOpen={openPreview}
      />
      {/* Only show the preview button and dialog if there are previewed OR saved aiEvents */}
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
