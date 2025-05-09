
import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarType } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type CalendarViewType = 'day' | 'month';

interface CalendarHeaderCenteredProps {
  calendar: CalendarType;
  currentDate: Date;
  viewMode: CalendarViewType;
  setViewMode: (mode: CalendarViewType) => void;
  handlePrevPeriod: () => void;
  handleNextPeriod: () => void;
  handleTodayClick: () => void;
  navigateToDashboard: () => void;
}

const CalendarHeaderCentered = ({
  calendar,
  currentDate,
  viewMode,
  setViewMode,
  handlePrevPeriod,
  handleNextPeriod,
  handleTodayClick,
  navigateToDashboard
}: CalendarHeaderCenteredProps) => {
  const getFormattedDateRange = () => {
    switch(viewMode) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return format(currentDate, 'MMMM d, yyyy');
    }
  };
  
  return (
    <div className="flex items-center w-full">
      {/* Left section: Home button & calendar title */}
      <div className="flex items-center gap-2 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={navigateToDashboard}
              title="Back to Dashboard"
              className="shrink-0"
            >
              <HomeIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Back to Dashboard
          </TooltipContent>
        </Tooltip>
        
        <div className="min-w-0 mr-4">
          <h1 className="text-xl font-semibold truncate" title={calendar.name}>{calendar.name}</h1>
          <p className="text-muted-foreground text-sm truncate" title={calendar.description}>{calendar.description}</p>
        </div>
      </div>
      
      {/* Center section: Date display properly centered with calendar */}
      <div className="flex-1 flex justify-center">
        <div className="text-lg font-medium whitespace-nowrap">
          {getFormattedDateRange()}
        </div>
      </div>
      
      {/* Right section: Controls with proper spacing */}
      <div className="flex-1 flex items-center justify-end gap-6">
        {/* Navigation controls */}
        <div className="flex items-center gap-1">
          <Button 
            onClick={handlePrevPeriod} 
            size="icon" 
            variant="outline"
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleTodayClick} 
            variant="outline"
            size="sm"
            className="h-9"
          >
            Today
          </Button>
          
          <Button 
            onClick={handleNextPeriod} 
            size="icon" 
            variant="outline"
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* View mode selector */}
        <div className="flex rounded-md border border-input overflow-hidden">
          <Button
            type="button"
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none"
            onClick={() => setViewMode('day')}
            style={viewMode === 'day' ? {
              backgroundColor: calendar.color || undefined,
              color: calendar.color ? '#ffffff' : undefined
            } : {}}
          >
            Day
          </Button>
          <Button
            type="button"
            variant={viewMode === 'month' ? 'default' : 'ghost'} 
            size="sm"
            className="rounded-none"
            onClick={() => setViewMode('month')}
            style={viewMode === 'month' ? {
              backgroundColor: calendar.color || undefined,
              color: calendar.color ? '#ffffff' : undefined
            } : {}}
          >
            Month
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeaderCentered;
