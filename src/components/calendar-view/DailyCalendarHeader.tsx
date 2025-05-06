
import React from 'react';
import { format } from 'date-fns';

interface DailyCalendarHeaderProps {
  selectedDate: Date;
}

const DailyCalendarHeader = ({ selectedDate }: DailyCalendarHeaderProps) => {
  return (
    <div className="text-center py-3 border-b">
      <h2 className="text-lg font-medium normal-case">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
    </div>
  );
};

export default DailyCalendarHeader;
