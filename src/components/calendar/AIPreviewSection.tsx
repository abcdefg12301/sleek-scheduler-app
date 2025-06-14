
import React from "react";
import { Event } from "@/types";
import EventsPreviewDialog from "./ai-generator/EventsPreviewDialog";
import { Button } from "../ui/button";

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
}

const AIPreviewSection: React.FC<AIPreviewSectionProps> = ({
  aiEvents,
  isOpen,
  setIsOpen,
  onDeleteEvent,
  onEditEvent,
  clearAllEvents,
  buttonVariant = "outline",
}) => {
  if (!aiEvents.length) return null;
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
        onEditEvent={onEditEvent}
        clearAllEvents={clearAllEvents}
      />
    </div>
  );
};
export default AIPreviewSection;
