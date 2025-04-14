
import React, { useState } from 'react';
import { format, isToday, isSameMonth, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { getCalendarDays } from '@/lib/date-utils';
import { Event } from '@/types';

interface DayProps {
  day: Date;
  currentMonth: Date;
  selectedDate: Date;
  events: Event[];
  onClick: (day: Date) => void;
  onEventClick: (event: Event) => void;
  onHover?: (day: Date) => void;
}

const Day = ({ day, currentMonth, selectedDate, events, onClick, onEventClick, onHover }: DayProps) => {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isSelected = isSameDay(day, selectedDate);
  
  const dayEvents = events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    return (
      day >= new Date(eventStart.setHours(0, 0, 0, 0)) &&
      day <= new Date(eventEnd.setHours(23, 59, 59, 999))
    );
  });
  
  const handleDayClick = () => {
    onClick(day);
  };
  
  const handleDayHover = () => {
    if (onHover) {
      onHover(day);
    }
  };
  
  return (
    <div
      className={cn(
        'calendar-day border border-border cursor-pointer',
        !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
        isToday(day) && 'today'
      )}
      onClick={handleDayClick}
      onMouseEnter={handleDayHover}
    >
      <div className="flex justify-between mb-1">
        <div
          className={cn(
            'day-number text-xs font-medium',
            isSelected && 'selected'
          )}
        >
          {format(day, 'd')}
        </div>
      </div>
      <div className="overflow-y-auto max-h-[80%]">
        {dayEvents.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="calendar-event text-xs truncate"
            style={{ backgroundColor: event.color || '#8B5CF6', color: 'white' }}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          >
            {event.title}
          </div>
        ))}
        {dayEvents.length > 3 && (
          <div className="text-xs text-muted-foreground mt-1">
            +{dayEvents.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

interface MonthlyCalendarProps {
  currentDate: Date;
  events: Event[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: Event) => void;
  onDayHover?: (date: Date) => void;
}

const MonthlyCalendar = ({
  currentDate,
  events,
  onDateSelect,
  onEventClick,
  onDayHover
}: MonthlyCalendarProps) => {
  const days = getCalendarDays(currentDate);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  const handleDayHover = (date: Date) => {
    setHoveredDate(date);
    if (onDayHover) {
      onDayHover(date);
    }
  };
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div>
      <div className="calendar-grid mb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-medium py-2 text-sm">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {days.map((day) => (
          <Day
            key={day.toString()}
            day={day}
            currentMonth={currentDate}
            selectedDate={currentDate}
            events={events}
            onClick={onDateSelect}
            onEventClick={onEventClick}
            onHover={handleDayHover}
          />
        ))}
      </div>
    </div>
  );
};

export default MonthlyCalendar;
