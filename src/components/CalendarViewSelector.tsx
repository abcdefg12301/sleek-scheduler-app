
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarClock, Calendar as CalendarIcon, LayoutGrid } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CalendarViewType = 'day' | 'week' | 'month';

interface CalendarViewSelectorProps {
  currentView: CalendarViewType;
  onChange: (view: CalendarViewType) => void;
}

const CalendarViewSelector = ({ currentView, onChange }: CalendarViewSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="hidden sm:flex space-x-1">
        <Button
          variant={currentView === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('day')}
          className="hidden sm:flex"
        >
          <CalendarClock className="w-4 h-4 mr-1" />
          Day
        </Button>
        <Button
          variant={currentView === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('week')}
          className="hidden sm:flex"
        >
          <CalendarIcon className="w-4 h-4 mr-1" />
          Week
        </Button>
        <Button
          variant={currentView === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('month')}
          className="hidden sm:flex"
        >
          <LayoutGrid className="w-4 h-4 mr-1" />
          Month
        </Button>
      </div>
      
      {/* Mobile selector */}
      <div className="sm:hidden">
        <Select
          value={currentView}
          onValueChange={(value) => onChange(value as CalendarViewType)}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CalendarViewSelector;
