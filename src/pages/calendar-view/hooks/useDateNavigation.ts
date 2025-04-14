
import { useState } from 'react';
import { addMonths, subMonths, addDays, subDays } from 'date-fns';

type CalendarViewType = 'day' | 'month';

export const useDateNavigation = (viewMode: CalendarViewType) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevPeriod = () => {
    if (viewMode === 'day') {
      setCurrentDate(subDays(currentDate, 1));
      setSelectedDate(subDays(selectedDate, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };
  
  const handleNextPeriod = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1));
      setSelectedDate(addDays(selectedDate, 1));
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
    
    // Switch to day view when clicking a day in month view
    if (viewMode === 'month') {
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
