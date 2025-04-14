
import React from 'react';
import { Calendar } from '@/types';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import CalendarNavigation from './CalendarNavigation';
import CalendarSettings from './CalendarSettings';

type CalendarViewType = 'day' | 'month';

interface CalendarHeaderProps {
  calendar: Calendar;
  currentDate: Date;
  viewMode: CalendarViewType;
  setViewMode: (mode: CalendarViewType) => void;
  handlePrevPeriod: () => void;
  handleNextPeriod: () => void;
  handleTodayClick: () => void;
  handleNewEvent: () => void;
  handleHolidaysToggle: (enabled: boolean) => void;
  setIsSleepScheduleDialogOpen: (open: boolean) => void;
  navigate: (path: string) => void;
}

const CalendarHeader = ({
  calendar,
  currentDate,
  viewMode,
  setViewMode,
  handlePrevPeriod,
  handleNextPeriod,
  handleTodayClick,
  handleNewEvent,
  handleHolidaysToggle,
  setIsSleepScheduleDialogOpen,
  navigate
}: CalendarHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <Home className="h-5 w-5" />
        </Button>
        <CalendarNavigation
          calendarName={calendar.name}
          calendarColor={calendar.color}
          currentDate={currentDate}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handlePrevPeriod={handlePrevPeriod}
          handleNextPeriod={handleNextPeriod}
          handleTodayClick={handleTodayClick}
        />
      </div>
      <CalendarSettings 
        calendarId={calendar.id}
        showHolidays={calendar.showHolidays || false}
        handleHolidaysToggle={handleHolidaysToggle}
        handleNewEvent={handleNewEvent}
        openSleepScheduleDialog={() => setIsSleepScheduleDialogOpen(true)}
      />
    </div>
  );
};

export default CalendarHeader;
