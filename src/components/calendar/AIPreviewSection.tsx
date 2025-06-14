
import React from "react";
import { Event } from "@/types";
import EventsPreviewDialog from "./ai-generator/EventsPreviewDialog";
import { Button } from "../ui/button";
import EventEditingDialog from "./ai-generator/EventEditingDialog";

/**
 * Provides a unified preview button & dialog for AI events, openable by button or programmatically.
 */
interface AIPreviewSectionProps {
  aiEvents: Event[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDeleteEvent: (index: number) => void;
  onEditEvent?: (event: Event, index: number) => void;
  clearAllEvents: () => void;
  buttonVariant?: "outline" | "default";
  setAiEvents?: (events: Event[]) => void; // For editing
}

const AIPreviewSection: React.FC<AIPreviewSectionProps> = ({
  aiEvents,
  isOpen,
  setIsOpen,
  onDeleteEvent,
  clearAllEvents,
  buttonVariant = "outline",
  setAiEvents,
}) => {
  const [editingEvent, setEditingEvent] = React.useState<{ event: Event; index: number } | null>(null);

  // Handler to open edit dialog
  const handleEditEvent = (event: Event, index: number) => {
    setEditingEvent({ event, index });
  };

  // When the edit dialog is submitted; update the aiEvents locally
  const handleUpdateEvent = (updatedEvent: Omit<Event, "id" | "calendarId">) => {
    if (editingEvent && setAiEvents) {
      setAiEvents(
        aiEvents.map((ev, idx) =>
          idx === editingEvent.index
            ? { ...ev, ...updatedEvent }
            : ev
        )
      );
    }
    setEditingEvent(null);
  };

  if (!aiEvents || aiEvents.length === 0) return null;
  return (
    <div className="flex w-full">
      <Button
        variant={buttonVariant}
        onClick={() => setIsOpen(true)}
        className="ml-auto"
        type="button"
      >
        Preview AI Events ({aiEvents.length})
      </Button>
      <EventsPreviewDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        events={aiEvents}
        onDeleteEvent={onDeleteEvent}
        onEditEvent={handleEditEvent}
        clearAllEvents={clearAllEvents}
      />
      <EventEditingDialog
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        onUpdateEvent={handleUpdateEvent}
      />
    </div>
  );
};
export default AIPreviewSection;
