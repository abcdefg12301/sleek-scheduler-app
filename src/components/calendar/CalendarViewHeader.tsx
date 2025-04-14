import React from 'react';
import { format, isToday } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import CalendarSettings from './CalendarSettings';
import { Calendar as CalendarType } from '@/types';

type CalendarViewType = 'day' | 'month';

interface CalendarViewHeaderProps {
  calendar: CalendarType;
  currentDate: Date;
  viewMode: CalendarViewType;
  setViewMode: (mode: CalendarViewType) => void;
  handlePrevPeriod: () => void;
  handleNextPeriod: () => void;
  handleTodayClick: () => void;
  handleNewEvent: () => void;
  handleHolidaysToggle: (enabled: boolean) => void;
  navigate: (path: string) => void;
}

const CalendarViewHeader = ({
  calendar,
  currentDate,
  viewMode,
  setViewMode,
  handlePrevPeriod,
  handleNextPeriod,
  handleTodayClick,
  handleNewEvent,
  handleHolidaysToggle,
  navigate
}: CalendarViewHeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  
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
    <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{calendar.name}</h1>
        <p className="text-muted-foreground">{calendar.description}</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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
            className={isToday(currentDate) ? 'font-bold' : ''}
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
          
          <span className="ml-2 font-medium">
            {getFormattedDateRange()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
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
          
          <CalendarSettings 
            calendarId={calendar.id}
            calendarColor={calendar.color}
            showHolidays={calendar.showHolidays || false}
            handleHolidaysToggle={handleHolidaysToggle}
            handleNewEvent={handleNewEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarViewHeader;
