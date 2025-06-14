
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
  calendarColor?: string;
}

const AIGeneratorSection: React.FC<AIGeneratorSectionProps> = ({
  aiEvents,
  setAiEvents,
  deleteAiEvent,
  clearAllEvents,
  calendarId,
  calendarColor,
}) => {
  const { isPreviewOpen, openPreview, setIsPreviewOpen } = useAIPreviewDialog(false);

  const onEventsGenerated = (events: Event[]) => {
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
