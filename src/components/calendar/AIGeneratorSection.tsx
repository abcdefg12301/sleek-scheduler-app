
import React from "react";
import AICalendarGenerator from "./AICalendarGenerator";
import AIPreviewSection from "./AIPreviewSection";
import { Event } from "@/types";
import { useAIPreviewDialog } from "@/hooks/useAIPreviewDialog";

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

  const onEventsGenerated = (events: Event[]) => {
    setAiEvents(events);
    openPreview();
  };

  // Only show one preview button (remove all other preview triggers)
  return (
    <div>
      <AICalendarGenerator
        standalone={false}
        calendarId={calendarId}
        existingEvents={aiEvents}
        onEventsGenerated={onEventsGenerated}
        onPreviewOpen={openPreview}
      />
      {/* Show preview section only if there are events */}
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
