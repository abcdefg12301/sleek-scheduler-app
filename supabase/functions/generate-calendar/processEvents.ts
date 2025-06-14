/**
 * Utility for processing AI-generated events, checking/fixing conflicts and enforcing breakdowns.
 * Enhanced: Multiple event output for creative requests, strong conflict avoidance.
 */

function isOverlapping(a, b) {
  return !(new Date(a.end) <= new Date(b.start) || new Date(a.start) >= new Date(b.end));
}

// Helper: forces breakdown of single event to routine if expected
function forceBreakdownIfNeeded(events, context) {
  // If user prompt is about a routine/plan, and only one event returned, duplicate into a spread-out breakdown
  if (events && events.length === 1) {
    const e = events[0];
    if (
      typeof context === "string" &&
      /(plan|schedule|routine|calendar|series|revision)/i.test(context)
    ) {
      // E.g., make 5 'Study' events for a study schedule
      const multiple = [];
      const baseStart = new Date(e.start);
      const baseEnd = new Date(e.end);
      for (let i = 0; i < 5; i++) {
        const start = new Date(baseStart.getTime());
        start.setDate(start.getDate() + i);
        const end = new Date(baseEnd.getTime());
        end.setDate(end.getDate() + i);
        multiple.push({
          ...e,
          title: e.title, // forced to be same general title
          start: start.toISOString().split('.')[0],
          end: end.toISOString().split('.')[0],
        });
      }
      return multiple;
    }
  }
  return events;
}

// Create a default event as a fallback
export function createDefaultEvent(text: string) {
  const title = text.split('.')[0].substring(0, 30) || "Event";
  const startDate = new Date();
  startDate.setHours(9, 0, 0, 0);
  const endDate = new Date();
  endDate.setHours(10, 0, 0, 0);
  return {
    title,
    description: "",
    start: startDate.toISOString().split('.')[0],
    end: endDate.toISOString().split('.')[0],
    allDay: false,
    color: getRandomEventColor(),
    isAIGenerated: true
  };
}

// Improved: 
// - Avoids overlaps with *all* events in same run.
// - For creative breakdowns, will skip or reschedule if can't fit except if absolutely necessary (in that case, keep as last-resort).
export function processAIGeneratedEvents(events: any[], prevEvents: any[] = [], context?: string) {
  let e = events || [];
  // 1. Patch: force breakdown if only 1 event for a repetitive routine/plan
  e = forceBreakdownIfNeeded(e, context);

  // 2. Stringent conflict-avoidance with both prev AND within e
  const currentDate = new Date();
  let scheduled: any[] = (prevEvents || []).map(ev => ({
    ...ev,
    start: new Date(ev.start),
    end: new Date(ev.end),
  }));
  const result: any[] = [];

  for (let idx = 0; idx < e.length; idx++) {
    const event = e[idx];
    let start, end;
    if (event.start) {
      start = new Date(event.start);
      if (isNaN(start.getTime()) || (typeof event.start === "string" && (event.start.includes('Z') || event.start.includes('+')))) {
        const cleanDateStr = event.start.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
        start = new Date(cleanDateStr);
      }
      if (isNaN(start.getTime())) {
        start = new Date(currentDate);
        start.setHours(9, 0, 0, 0);
      }
    } else {
      start = new Date(currentDate);
      start.setHours(9, 0, 0, 0);
    }

    if (event.end) {
      end = new Date(event.end);
      if (isNaN(end.getTime()) || (typeof event.end === "string" && (event.end.includes('Z') || event.end.includes('+')))) {
        const cleanDateStr = event.end.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
        end = new Date(cleanDateStr);
      }
      if (isNaN(end.getTime())) {
        end = new Date(start);
        end.setHours(start.getHours() + 1);
      }
    } else {
      end = new Date(start);
      end.setHours(start.getHours() + 1);
    }

    let recurrence = null;
    if (event.recurrence) {
      recurrence = {
        frequency: event.recurrence.frequency || "weekly",
        interval: event.recurrence.interval || 1,
        daysOfWeek: event.recurrence.daysOfWeek || undefined
      };
    }

    // Avoid overlap with already scheduled events
    let isConflict = scheduled.some(ev => isOverlapping({ start, end }, ev));
    let attempts = 0;
    while (isConflict && attempts < 24) { // Try up to a day of small shifts
      start = new Date(start.getTime() + 60 * 60 * 1000);
      end = new Date(end.getTime() + 60 * 60 * 1000);
      isConflict = scheduled.some(ev => isOverlapping({ start, end }, ev));
      attempts++;
    }
    // After attempts, if still conflict, schedule as is (worst-case: notify)
    scheduled.push({ start, end });

    result.push({
      title: event.title || "Untitled Event",
      description: event.description || "",
      start: start.toISOString().split('.')[0],
      end: end.toISOString().split('.')[0],
      allDay: event.allDay || false,
      color: getRandomEventColor(),
      isAIGenerated: true,
      recurrence
    });
  }

  return result;
}

function getRandomEventColor() {
  const colors = [
    "#4285F4", // Blue
    "#0F9D58", // Green
    "#F4B400", // Yellow
    "#DB4437", // Red
    "#9C27B0", // Purple
    "#00ACC1", // Cyan
    "#FF7043", // Deep Orange
    "#3949AB"  // Indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
