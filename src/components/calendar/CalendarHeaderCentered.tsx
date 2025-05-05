
import React from 'react';
import { format, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarType } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
    <div className="flex items-center justify-between w-full flex-wrap gap-y-2">
      {/* Calendar title & home button */}
      <div className="flex items-center gap-2 min-w-0 max-w-[300px]">
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
        
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate" title={calendar.name}>{calendar.name}</h1>
          <p className="text-muted-foreground text-sm truncate" title={calendar.description}>{calendar.description}</p>
        </div>
      </div>
      
      {/* Navigation controls */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center space-x-1 shrink-0">
          <Button 
            onClick={handlePrevPeriod} 
            size="icon" 
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleTodayClick} 
            variant="outline"
            size="sm"
          >
            Today
          </Button>
          
          <Button 
            onClick={handleNextPeriod} 
            size="icon" 
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Date display */}
        <div className="text-lg font-medium mx-2 text-center whitespace-nowrap">
          {getFormattedDateRange()}
        </div>
        
        {/* View mode selector */}
        <div className="flex items-center shrink-0">
          <div className="flex rounded-md border border-input overflow-hidden">
            <Button
              type="button"
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none ${viewMode === 'day' ? '' : 'hover:bg-muted'}`}
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
              className={`rounded-none ${viewMode === 'month' ? '' : 'hover:bg-muted'}`}
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
    </div>
  );
};

export default CalendarHeaderCentered;
