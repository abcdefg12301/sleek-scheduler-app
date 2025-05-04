
import { useMemo } from 'react';
import { Event as CalendarEvent } from '@/types';
import { isSameDay, differenceInMinutes, addDays } from 'date-fns';

// Custom hook to calculate event layouts for the daily calendar view
export function useDailyEventLayout(events: CalendarEvent[], selectedDate: Date) {
  return useMemo(() => {
    // Calculate positions and sizes for all events
    const layouts: {
      [id: string]: {
        top: number;
        height: number;
        left: number;
        width: number;
        overlappingEvents: number;
      }
    } = {};
    
    if (!events.length) return layouts;
    
    // Group events by time slots to detect overlaps
    interface TimeSlot {
      events: CalendarEvent[];
      start: number; // minutes from midnight
      end: number;   // minutes from midnight
    }
    
    // Create time slots for overlap detection
    const timeSlots: TimeSlot[] = [];
    
    events.forEach(event => {
      if (event.allDay) return; // Skip all-day events
      
      // Get start and end times relative to the day
      const startDate = new Date(event.start);
      let endDate = new Date(event.end);
      
      // Handle events that go past midnight
      if (!isSameDay(startDate, endDate)) {
        if (isSameDay(selectedDate, startDate)) {
          // For events starting on this day, end at midnight
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59);
        } else if (isSameDay(selectedDate, endDate)) {
          // For events ending on this day, start at midnight
          const adjustedStart = new Date(endDate);
          adjustedStart.setHours(0, 0, 0);
          timeSlots.push({
            events: [event],
            start: 0,
            end: endDate.getHours() * 60 + endDate.getMinutes()
          });
          return;
        } else {
          // For events completely spanning this day, use full day
          timeSlots.push({
            events: [event],
            start: 0,
            end: 24 * 60
          });
          return;
        }
      }
      
      // Calculate minutes from midnight
      const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
      const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
      
      // Add to existing slot or create new slot
      let added = false;
      
      for (const slot of timeSlots) {
        // Check for overlap
        if ((startMinutes >= slot.start && startMinutes < slot.end) ||
            (endMinutes > slot.start && endMinutes <= slot.end) ||
            (startMinutes <= slot.start && endMinutes >= slot.end)) {
          slot.events.push(event);
          // Expand slot if needed
          slot.start = Math.min(slot.start, startMinutes);
          slot.end = Math.max(slot.end, endMinutes);
          added = true;
          break;
        }
      }
      
      // Create new slot if no overlap
      if (!added) {
        timeSlots.push({
          events: [event],
          start: startMinutes,
          end: endMinutes
        });
      }
    });
    
    // Merge overlapping slots
    let merged = true;
    while (merged) {
      merged = false;
      for (let i = 0; i < timeSlots.length; i++) {
        for (let j = i + 1; j < timeSlots.length; j++) {
          const slotA = timeSlots[i];
          const slotB = timeSlots[j];
          
          // Check for overlap
          if ((slotA.start <= slotB.end && slotA.end >= slotB.start) ||
              (slotB.start <= slotA.end && slotB.end >= slotA.start)) {
            // Merge slots
            slotA.events = [...slotA.events, ...slotB.events];
            slotA.start = Math.min(slotA.start, slotB.start);
            slotA.end = Math.max(slotA.end, slotB.end);
            timeSlots.splice(j, 1);
            merged = true;
            break;
          }
        }
        if (merged) break;
      }
    }
    
    // Calculate layout for each event within its time slot
    timeSlots.forEach(slot => {
      const eventsInSlot = slot.events;
      
      eventsInSlot.forEach((event, index) => {
        const startDate = new Date(event.start);
        let endDate = new Date(event.end);
        
        // Adjust for multi-day events
        if (!isSameDay(startDate, endDate)) {
          if (isSameDay(selectedDate, startDate)) {
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59);
          } else if (isSameDay(selectedDate, endDate)) {
            startDate.setHours(0, 0, 0);
          } else {
            startDate.setHours(0, 0, 0);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59);
          }
        }
        
        // Calculate time percentages
        const minutesInDay = 24 * 60;
        const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
        const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
        
        // Convert to percentages
        const top = (startMinutes / minutesInDay) * 100;
        const height = ((endMinutes - startMinutes) / minutesInDay) * 100;
        
        // Calculate width and left position based on number of events in this slot
        const width = 100 / eventsInSlot.length;
        const left = width * index;
        
        layouts[event.id] = {
          top,
          height: Math.max(height, 1), // Ensure minimum height
          left,
          width,
          overlappingEvents: eventsInSlot.length
        };
      });
    });
    
    return layouts;
  }, [events, selectedDate]);
}
