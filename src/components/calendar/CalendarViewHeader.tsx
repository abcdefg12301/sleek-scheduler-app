
import React from 'react';
import { Calendar } from '@/types';
import CalendarHeaderCentered from './CalendarHeaderCentered';
import CalendarSettings from './CalendarSettings';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';

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
      <div className="grid grid-cols-1 gap-4">
        <div className="w-full">
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
        
        <div className="flex justify-end items-center gap-2">
          <Button
            onClick={handleNewEvent}
            style={{
              backgroundColor: calendar.color || undefined,
              color: calendar.color ? '#ffffff' : undefined
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Event
          </Button>
          
          <CalendarSettings 
            calendarId={calendar.id}
            showHolidays={calendar.showHolidays}
            handleHolidaysToggle={handleHolidaysToggle}
            showNewEventButton={false}
            onNewEvent={handleNewEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarViewHeader;
