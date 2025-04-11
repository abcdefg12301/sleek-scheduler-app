
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarHeader from '@/components/CalendarHeader';
import CalendarViewSelector from '@/components/CalendarViewSelector';

type CalendarViewType = 'day' | 'month';

interface CalendarNavigationProps {
  calendarName: string;
  calendarColor: string;
  currentDate: Date;
  viewMode: CalendarViewType;
  setViewMode: (mode: CalendarViewType) => void;
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
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <h1 className="text-xl md:text-2xl font-bold flex-grow text-center">
          <span 
            className="inline-block w-3 h-3 md:w-4 md:h-4 rounded-full mr-2"
            style={{ backgroundColor: calendarColor }}
          />
          {calendarName}
        </h1>
        
        <div className="flex items-center space-x-2">
          {/* Header buttons will be added by parent component */}
        </div>
      </div>
      
      <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2 mb-6">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevPeriod}
          onNextMonth={handleNextPeriod}
          onToday={handleTodayClick}
          viewMode={viewMode}
        />
        
        <CalendarViewSelector 
          currentView={viewMode}
          onChange={setViewMode}
          availableViews={['day', 'month']}
        />
      </div>
    </>
  );
};

export default CalendarNavigation;
