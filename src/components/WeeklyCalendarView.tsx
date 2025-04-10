
import React from 'react';
import { format, addDays, startOfWeek, isSameDay, isSameMonth } from 'date-fns';
import { Event } from '@/types';
import { cn } from '@/lib/utils';
import EventDisplay from './EventDisplay';

interface WeeklyCalendarViewProps {
  currentDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateSelect: (date: Date) => void;
}

const WeeklyCalendarView = ({ 
  currentDate,
  events,
  onEventClick,
  onDateSelect
}: WeeklyCalendarViewProps) => {
  console.log('Rendering weekly view for week of:', format(currentDate, 'yyyy-MM-dd'));
  
  const startOfCurrentWeek = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  
  console.log(`Week starts on: ${format(weekDays[0], 'yyyy-MM-dd')}`);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getEventsForDay = (date: Date) => {
    return events
      .filter(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return isSameDay(date, eventStart) || 
               isSameDay(date, eventEnd) ||
               (date >= eventStart && date <= eventEnd);
      })
      .sort((a, b) => {
        // Sort by all-day first, then by start time
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
  };

  return (
    <div className="weekly-calendar w-full h-full">
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day, i) => (
          <div 
            key={i}
            onClick={() => onDateSelect(day)} 
            className={cn(
              "text-center py-2 cursor-pointer hover:bg-muted/50",
              isSameDay(day, new Date()) && "bg-orange-100 dark:bg-orange-900/20",
              !isSameMonth(day, currentDate) && "text-muted-foreground"
            )}
          >
            <div className="text-xs font-medium">{format(day, 'EEE')}</div>
            <div className={cn(
              "text-lg mt-1 h-8 w-8 rounded-full flex items-center justify-center mx-auto",
              isSameDay(day, currentDate) && "bg-primary text-primary-foreground"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-[60px_1fr] h-[calc(100vh-280px)] overflow-y-auto">
        <div className="border-r">
          {hours.map(hour => (
            <div key={hour} className="h-16 flex items-start justify-end pr-2 text-xs text-muted-foreground">
              {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="border-r last:border-r-0">
              {hours.map(hour => {
                const dayEvents = getEventsForDay(day).filter(event => {
                  if (event.allDay) return hour === 0;
                  return new Date(event.start).getHours() === hour;
                });
                
                return (
                  <div key={hour} className="h-16 border-b relative">
                    {dayEvents.map((event, index) => (
                      <div 
                        key={event.id}
                        className="absolute left-1 right-1 z-10"
                        style={{ 
                          top: event.allDay ? 0 : `${new Date(event.start).getMinutes() / 60 * 100}%`,
                        }}
                      >
                        <div className="scale-90">
                          <EventDisplay 
                            event={event} 
                            onClick={() => onEventClick(event)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
