
import React from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DayPreviewBarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DayPreviewBar = ({ selectedDate, onSelectDate }: DayPreviewBarProps) => {
  // Show 7 days starting from selectedDate - 3 days
  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - 3);
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    return {
      date,
      dayOfWeek: format(date, 'EEE'),
      dayOfMonth: format(date, 'd'),
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, selectedDate)
    };
  });

  return (
    <div className="flex justify-between items-center border-b mb-2 pb-2">
      {days.map((day) => (
        <div
          key={day.date.toString()}
          className={cn(
            "flex flex-col items-center cursor-pointer py-2 px-3 rounded-md transition-colors",
            day.isSelected && "bg-primary/10",
            day.isToday && "font-bold",
            !day.isSelected && "hover:bg-muted"
          )}
          onClick={() => onSelectDate(day.date)}
        >
          <span className="text-xs text-muted-foreground">{day.dayOfWeek}</span>
          <span className={cn(
            "text-sm mt-1 w-6 h-6 rounded-full flex items-center justify-center",
            day.isSelected && "bg-primary text-primary-foreground",
            day.isToday && !day.isSelected && "border border-primary"
          )}>
            {day.dayOfMonth}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DayPreviewBar;
