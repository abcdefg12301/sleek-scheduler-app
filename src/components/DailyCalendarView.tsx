
import React, { useMemo } from 'react';
import { 
  format, isSameDay, differenceInMinutes, 
  isWithinInterval, isBefore, isAfter, 
  startOfDay, endOfDay, isEqual, addDays
} from 'date-fns';
import { Event } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import AllDayEvents from './calendar-view/AllDayEvents';
import HourLabels from './calendar-view/HourLabels';
import DailyCalendarGrid from './calendar-view/DailyCalendarGrid';

interface DailyCalendarViewProps {
  selectedDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

const DailyCalendarView = ({ selectedDate, events, onEventClick }: DailyCalendarViewProps) => {
  // Get the events for the selected day
  const dailyEvents = useMemo(() => {
    // Filter events for the selected day including those that overlap with midnight
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      
      // Check if the event overlaps with the selected day
      return (
        // Event starts within the day
        isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
        // Event ends within the day
        isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
        // Event spans over the entire day
        (isBefore(eventStart, dayStart) && isAfter(eventEnd, dayEnd)) ||
        // Exact day matches
        isSameDay(eventStart, selectedDate) || 
        isSameDay(eventEnd, selectedDate)
      );
    }).sort((a, b) => {
      // Sort by all-day first, then by start time
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  }, [events, selectedDate]);
  
  // Group all-day events separately
  const allDayEvents = useMemo(() => {
    return dailyEvents.filter(event => event.allDay);
  }, [dailyEvents]);
  
  // Get timed events
  const timedEvents = useMemo(() => {
    return dailyEvents.filter(event => !event.allDay);
  }, [dailyEvents]);
  
  // Process the events by hour for visualization
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate event layout data for positioning
  const eventLayouts = useMemo(() => {
    // Final layouts object to return
    const layouts: {
      [id: string]: {
        top: number;
        height: number;
        left: number;
        width: number;
        overlappingEvents: number;
      }
    } = {};
    
    if (timedEvents.length === 0) return layouts;
    
    // First pass: determine time boundaries and create event time slots
    const eventTimeSlots: {
      event: Event;
      adjustedStart: Date;
      adjustedEnd: Date;
    }[] = [];
    
    timedEvents.forEach(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      
      // Adjust event times to day boundaries if needed
      const adjustedStart = isBefore(eventStart, dayStart) ? dayStart : eventStart;
      const adjustedEnd = isAfter(eventEnd, dayEnd) ? dayEnd : eventEnd;
      
      eventTimeSlots.push({
        event,
        adjustedStart,
        adjustedEnd
      });
    });
    
    // Sort events by start time and then by duration (longer events first)
    eventTimeSlots.sort((a, b) => {
      const startDiff = a.adjustedStart.getTime() - b.adjustedStart.getTime();
      if (startDiff !== 0) return startDiff;
      
      const aDuration = differenceInMinutes(a.adjustedEnd, a.adjustedStart);
      const bDuration = differenceInMinutes(b.adjustedEnd, b.adjustedStart);
      return bDuration - aDuration; // Longer events first
    });
    
    // Group overlapping events
    const findOverlappingEvents = (timeSlot: typeof eventTimeSlots[0], allSlots: typeof eventTimeSlots) => {
      return allSlots.filter(other => {
        if (other.event.id === timeSlot.event.id) return false;
        
        return (
          (isAfter(other.adjustedStart, timeSlot.adjustedStart) && isBefore(other.adjustedStart, timeSlot.adjustedEnd)) ||
          (isAfter(other.adjustedEnd, timeSlot.adjustedStart) && isBefore(other.adjustedEnd, timeSlot.adjustedEnd)) ||
          (isBefore(other.adjustedStart, timeSlot.adjustedStart) && isAfter(other.adjustedEnd, timeSlot.adjustedEnd)) ||
          isEqual(other.adjustedStart, timeSlot.adjustedStart) ||
          isEqual(other.adjustedEnd, timeSlot.adjustedEnd)
        );
      });
    };
    
    // Track columns already assigned to events
    const eventColumns: { [id: string]: number } = {};
    const eventGroups: { [groupId: string]: string[] } = {};
    let groupCounter = 0;
    
    // First, group overlapping events
    eventTimeSlots.forEach((timeSlot, index) => {
      const eventId = timeSlot.event.id;
      
      // Skip if already assigned to a group
      if (Object.values(eventGroups).some(group => group.includes(eventId))) {
        return;
      }
      
      // Find all events that overlap with this one
      const overlapping = findOverlappingEvents(timeSlot, eventTimeSlots);
      
      if (overlapping.length > 0) {
        // Create a new group with this event and overlapping events
        const groupId = `group_${groupCounter++}`;
        eventGroups[groupId] = [eventId, ...overlapping.map(o => o.event.id)];
      } else {
        // No overlaps, create a single-event group
        const groupId = `group_${groupCounter++}`;
        eventGroups[groupId] = [eventId];
      }
    });
    
    // Process each group to assign columns
    Object.values(eventGroups).forEach(group => {
      const groupSize = group.length;
      
      // Sort events in the group by start time
      const sortedGroupEvents = group
        .map(id => eventTimeSlots.find(slot => slot.event.id === id)!)
        .sort((a, b) => a.adjustedStart.getTime() - b.adjustedStart.getTime());
      
      // Track which columns are used at specific times
      const usedColumnsAtTimes: { 
        [time: number]: { [column: number]: boolean } 
      } = {};
      
      // Assign columns to events in this group
      sortedGroupEvents.forEach(timeSlot => {
        const eventId = timeSlot.event.id;
        const eventStart = timeSlot.adjustedStart.getTime();
        
        // Find a free column for this event
        let column = 0;
        while (true) {
          // Check if this column is free at this time
          const isColumnFree = !Object.keys(usedColumnsAtTimes).some(timeKey => {
            const time = parseInt(timeKey);
            // Check if event overlaps with this time
            if (time >= eventStart && time <= timeSlot.adjustedEnd.getTime()) {
              return usedColumnsAtTimes[time]?.[column];
            }
            return false;
          });
          
          if (isColumnFree || column >= groupSize - 1) {
            break;
          }
          
          column++;
        }
        
        // Mark this column as used for the duration of the event
        for (let t = eventStart; t <= timeSlot.adjustedEnd.getTime(); t += 15 * 60 * 1000) { // 15-min increments
          if (!usedColumnsAtTimes[t]) {
            usedColumnsAtTimes[t] = {};
          }
          usedColumnsAtTimes[t][column] = true;
        }
        
        eventColumns[eventId] = column;
      });
      
      // Calculate layout for each event in the group
      sortedGroupEvents.forEach(timeSlot => {
        const eventId = timeSlot.event.id;
        const column = eventColumns[eventId];
        
        // Calculate day-relative positions
        const dayStart = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);
        
        // Calculate height and top position
        const startMinutes = (timeSlot.adjustedStart.getHours() * 60) + timeSlot.adjustedStart.getMinutes();
        const endMinutes = (timeSlot.adjustedEnd.getHours() * 60) + timeSlot.adjustedEnd.getMinutes();
        
        const top = (startMinutes / (24 * 60)) * 100;
        const height = ((endMinutes - startMinutes) / (24 * 60)) * 100;
        
        // Width calculation based on the number of events in this group
        const width = 100 / groupSize;
        const left = column * width;
        
        layouts[eventId] = {
          top,
          height,
          left,
          width,
          overlappingEvents: groupSize
        };
      });
    });
    
    return layouts;
  }, [timedEvents, selectedDate]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center py-4 border-b">
        <h2 className="text-xl font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>
      
      {/* All-day events section */}
      <AllDayEvents events={allDayEvents} onEventClick={onEventClick} />
      
      {/* Time-based events section */}
      <div className="flex-grow h-[calc(100vh-240px)]">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-[60px_1fr] min-h-full">
            {/* Hour labels */}
            <HourLabels hours={hours} />
            
            {/* Event slots */}
            <DailyCalendarGrid
              hours={hours}
              timedEvents={timedEvents}
              eventLayouts={eventLayouts}
              onEventClick={onEventClick}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DailyCalendarView;
