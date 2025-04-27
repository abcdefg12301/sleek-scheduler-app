
import React from 'react';
import { format, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarType } from '@/types';

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
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        {/* Calendar title & home button */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={navigateToDashboard}
            title="Back to Dashboard"
          >
            <HomeIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">{calendar.name}</h1>
            <p className="text-muted-foreground text-sm">{calendar.description}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 md:mt-0">
          {/* Date display */}
          <div className="text-lg font-medium mr-2">
            {getFormattedDateRange()}
          </div>
          
          {/* Navigation controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1">
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
            
            <div className="flex items-center">
              <div className="flex rounded-md border border-input overflow-hidden">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeaderCentered;
