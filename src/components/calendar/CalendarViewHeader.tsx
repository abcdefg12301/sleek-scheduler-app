
import React from 'react';
import { Calendar } from '@/types';
import CalendarHeaderCentered from './CalendarHeaderCentered';
import CalendarSettings from './CalendarSettings';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

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
}: CalendarHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between w-full">
        <CalendarHeaderCentered
          calendar={calendar}
          currentDate={currentDate}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handlePrevPeriod={handlePrevPeriod}
          handleNextPeriod={handleNextPeriod}
          handleTodayClick={handleTodayClick}
          navigateToDashboard={() => navigate('/')}
        />
      </div>
    </div>
  );
};

export default CalendarViewHeader;
