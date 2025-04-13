
import React from 'react';
import { format } from 'date-fns';

interface DailyCalendarHeaderProps {
  selectedDate: Date;
}

const DailyCalendarHeader = ({ selectedDate }: DailyCalendarHeaderProps) => {
  return (
    <div className="text-center py-4 border-b">
      <h2 className="text-xl font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
    </div>
  );
};

export default DailyCalendarHeader;
