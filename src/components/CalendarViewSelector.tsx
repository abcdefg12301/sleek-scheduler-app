
import { Button } from "@/components/ui/button";
import { CalendarClock, CalendarDays } from "lucide-react";

type ViewType = "day" | "week" | "month";

interface CalendarViewSelectorProps {
  currentView: ViewType;
  onChange: (view: ViewType) => void;
  availableViews?: ViewType[];
}

const CalendarViewSelector = ({ 
  currentView, 
  onChange,
  availableViews = ["day", "month"]
}: CalendarViewSelectorProps) => {
  return (
    <div className="flex bg-muted/20 rounded-lg p-1">
      {availableViews.includes("day") && (
        <Button
          variant={currentView === "day" ? "default" : "ghost"}
          size="sm"
          className="flex items-center"
          onClick={() => onChange("day")}
        >
          <CalendarClock className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Day</span>
        </Button>
      )}
      
      {availableViews.includes("month") && (
        <Button
          variant={currentView === "month" ? "default" : "ghost"}
          size="sm"
          className="flex items-center"
          onClick={() => onChange("month")}
        >
          <CalendarDays className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Month</span>
        </Button>
      )}
    </div>
  );
};

export default CalendarViewSelector;
