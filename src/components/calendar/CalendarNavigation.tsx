
import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarNavigationProps {
  calendarName: string;
  calendarColor: string;
  currentDate: Date;
  viewMode: 'day' | 'month';
  setViewMode: (mode: 'day' | 'month') => void;
  handlePrevPeriod: () => void;
  handleNextPeriod: () => void;
  handleTodayClick: () => void;
}

const CalendarNavigation = ({
  calendarName,
  calendarColor,
  currentDate,
  viewMode,
  setViewMode,
  handlePrevPeriod,
  handleNextPeriod,
  handleTodayClick,
}: CalendarNavigationProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: calendarColor }}
        />
        <h1 className="text-2xl font-bold">{calendarName}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleTodayClick}>
          Today
        </Button>
        
        <div className="flex items-center border rounded-md overflow-hidden">
          <Button variant="ghost" size="sm" onClick={handlePrevPeriod} className="px-2 h-9 rounded-none border-r">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="px-3 flex items-center justify-center min-w-[150px]">
            <span className="font-medium">
              {viewMode === 'month' ? (
                format(currentDate, 'MMMM yyyy')
              ) : (
                format(currentDate, 'MMMM d, yyyy')
              )}
            </span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleNextPeriod} className="px-2 h-9 rounded-none border-l">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="border rounded-md flex overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('day')}
            className={cn(
              "px-3 h-9 rounded-none",
              viewMode === 'day' && "bg-primary text-primary-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Day
          </Button>
          <Button
            variant="ghost"
            size="sm" 
            onClick={() => setViewMode('month')}
            className={cn(
              "px-3 h-9 rounded-none border-l",
              viewMode === 'month' && "bg-primary text-primary-foreground"
            )}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Month
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarNavigation;
