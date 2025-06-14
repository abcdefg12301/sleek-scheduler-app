
/**
 * Utility for processing AI-generated events and formatting/fallbacks.
 * This is moved from generate-calendar edge function to reduce file size.
 */

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

export function processAIGeneratedEvents(events: any[]) {
  const currentDate = new Date();
  return events.map(event => {
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
    return {
      title: event.title || "Untitled Event",
      description: event.description || "",
      start: start.toISOString().split('.')[0],
      end: end.toISOString().split('.')[0],
      allDay: event.allDay || false,
      color: getRandomEventColor(),
      isAIGenerated: true,
      recurrence
    };
  });
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
