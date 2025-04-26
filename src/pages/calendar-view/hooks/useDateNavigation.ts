
import { useState } from 'react';
import { addMonths, subMonths, addDays, subDays } from 'date-fns';

type CalendarViewType = 'day' | 'month';

export const useDateNavigation = (viewMode: CalendarViewType) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevPeriod = () => {
    if (viewMode === 'day') {
      const newDate = subDays(currentDate, 1);
      setCurrentDate(newDate);
      setSelectedDate(newDate);
    } else if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };
  
  const handleNextPeriod = () => {
    if (viewMode === 'day') {
      const newDate = addDays(currentDate, 1);
      setCurrentDate(newDate);
      setSelectedDate(newDate);
    } else if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };
  
  const handleTodayClick = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    if (viewMode === 'month') {
      setCurrentDate(date);
    } else {
      setCurrentDate(date);
    }
  };

  return {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    handlePrevPeriod,
    handleNextPeriod,
    handleTodayClick,
    handleDateSelect
  };
};
