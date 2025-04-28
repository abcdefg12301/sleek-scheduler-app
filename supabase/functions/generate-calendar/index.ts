
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { calendarDetails } = await req.json();
    console.log("Received request to generate calendar with details:", calendarDetails);

    if (!calendarDetails || typeof calendarDetails !== 'string') {
      console.error("Invalid calendar details:", calendarDetails);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request: calendar details must be a string' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse the calendar details to create more realistic events
    const events = parseCalendarDetailsIntoEvents(calendarDetails);
    console.log("Generated events:", events);

    return new Response(
      JSON.stringify({ events }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Error generating calendar:", error);
    return new Response(
      JSON.stringify({ 
        error: `Server error: ${error.message || "Unknown error"}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function parseCalendarDetailsIntoEvents(details: string) {
  // This is a parser that identifies event patterns in the text
  const events = [];
  const currentDate = new Date();
  
  // Regex patterns for common time and date formats
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?(?:\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?)?/g;
  const weekdayRegex = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/gi;
  const everydayRegex = /\b(every\s*day|daily)\b/gi;
  const weeklyRegex = /\b(every\s*week|weekly)\b/gi;
  const monthlyRegex = /\b(every\s*month|monthly)\b/gi;
  const yearlyRegex = /\b(every\s*year|yearly|annually)\b/gi;
  const specificDateRegex = /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/g;
  const noRepeatIndicators = /\b(only|once|one-time|single)\b/gi;
  
  // Helper to parse and standardize time
  const parseTime = (hour: string, minute: string = "00", ampm: string = "") => {
    let h = parseInt(hour, 10);
    const m = parseInt(minute || "0", 10);
    
    // Convert to 24-hour format if AM/PM is provided
    if (ampm && ampm.toLowerCase() === "pm" && h < 12) {
      h += 12;
    } else if (ampm && ampm.toLowerCase() === "am" && h === 12) {
      h = 0;
    }
    
    return { hour: h, minute: m };
  };

  // Check for specific date patterns
  let specificDate: Date | null = null;
  let specificDateMatch;
  const dateMatches = [];
  
  while ((specificDateMatch = specificDateRegex.exec(details)) !== null) {
    const month = parseInt(specificDateMatch[1], 10) - 1; // 0-indexed months
    const day = parseInt(specificDateMatch[2], 10);
    let year = specificDateMatch[3] ? parseInt(specificDateMatch[3], 10) : currentDate.getFullYear();
    
    // Fix 2-digit years
    if (year < 100) {
      year += 2000;
    }
    
    const date = new Date(year, month, day);
    dateMatches.push(date);
  }
  
  if (dateMatches.length > 0) {
    specificDate = dateMatches[0]; // Use the first date found
  }

  // Extract recurring days
  let recurringDays = [];
  let matchWeekday;
  while ((matchWeekday = weekdayRegex.exec(details)) !== null) {
    const day = matchWeekday[0].toLowerCase();
    const dayMap: {[key: string]: number} = {
      'monday': 1, 'mon': 1,
      'tuesday': 2, 'tue': 2, 
      'wednesday': 3, 'wed': 3,
      'thursday': 4, 'thu': 4,
      'friday': 5, 'fri': 5,
      'saturday': 6, 'sat': 6,
      'sunday': 0, 'sun': 0
    };
    
    if (dayMap[day] !== undefined) {
      recurringDays.push(dayMap[day]);
    }
  }
  
  // Determine recurrence pattern
  let recurrenceType = null;
  let noRepeat = noRepeatIndicators.test(details);
  
  if (specificDate !== null || noRepeat) {
    recurrenceType = "none"; // One-time event
  } else if (everydayRegex.test(details)) {
    recurrenceType = "daily";
    recurringDays = [0, 1, 2, 3, 4, 5, 6]; // All days of the week
  } else if (weeklyRegex.test(details)) {
    recurrenceType = "weekly";
    // If no specific days mentioned, default to today
    if (recurringDays.length === 0) {
      recurringDays = [currentDate.getDay()];
    }
  } else if (monthlyRegex.test(details)) {
    recurrenceType = "monthly";
    recurringDays = [currentDate.getDay()]; // Use current day of week
  } else if (yearlyRegex.test(details)) {
    recurrenceType = "yearly";
  } else if (recurringDays.length > 0) {
    // If we found specific days but no explicit recurrence pattern
    recurrenceType = "weekly";
  } else {
    // Default case - if we can't determine recurrence pattern
    // and there are no specific dates, assume it's a one-time event
    recurrenceType = "none";
  }

  // Extract title from details
  const eventTitle = extractEventTitle(details);

  // Look for time patterns
  let matchTime;
  const timeMatches = [];
  while ((matchTime = timeRegex.exec(details)) !== null) {
    const startHour = matchTime[1];
    const startMinute = matchTime[2];
    const startAmpm = matchTime[3];
    
    const endHour = matchTime[4];
    const endMinute = matchTime[5];
    const endAmpm = matchTime[6] || startAmpm; // Default to same AM/PM as start if not specified
    
    if (startHour) {
      const startTime = parseTime(startHour, startMinute, startAmpm);
      
      // Default end time is start time + 1 hour if not specified
      let endTime = { hour: startTime.hour + 1, minute: startTime.minute };
      if (endHour) {
        endTime = parseTime(endHour, endMinute, endAmpm);
      }
      
      timeMatches.push({ start: startTime, end: endTime });
    }
  }
  
  // If no specific times were found, create a default time
  if (timeMatches.length === 0) {
    timeMatches.push({
      start: { hour: 9, minute: 0 },
      end: { hour: 10, minute: 0 }
    });
  }
  
  // Generate events based on the extracted patterns
  if (recurrenceType === "none" || specificDate !== null) {
    // Create a one-time event
    const eventDate = specificDate || new Date(currentDate);
    
    // Use the first time pattern found
    const timePattern = timeMatches[0];
    
    // Create start and end dates
    const startDate = new Date(eventDate);
    startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
    
    const endDate = new Date(eventDate);
    endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
    
    // Handle case where end time is earlier than start time (next day)
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    // Create the event object
    events.push({
      title: eventTitle,
      description: "",
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: false,
      color: getRandomEventColor(),
      isAIGenerated: true
      // No recurrence for one-time events
    });
  } else {
    // Handle recurring events differently based on the type
    if (recurrenceType === "daily") {
      // For daily events, create just one event with daily recurrence
      const eventDate = new Date(currentDate);
      const timePattern = timeMatches[0];
      
      const startDate = new Date(eventDate);
      startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
      
      const endDate = new Date(eventDate);
      endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
      
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      events.push({
        title: eventTitle,
        description: "",
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: false,
        color: getRandomEventColor(),
        isAIGenerated: true,
        recurrence: {
          frequency: "daily",
          interval: 1,
          count: 30 // Repeat for 30 occurrences by default
        }
      });
    } else if (recurrenceType === "weekly") {
      // For weekly recurrence, create one event per day of the week specified
      recurringDays.forEach(dayOfWeek => {
        // Find the next occurrence of this day of the week
        let eventDate = new Date(currentDate);
        while (eventDate.getDay() !== dayOfWeek) {
          eventDate.setDate(eventDate.getDate() + 1);
        }
        
        // Use the first time pattern for all days
        const timePattern = timeMatches[0];
        
        const startDate = new Date(eventDate);
        startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
        
        const endDate = new Date(eventDate);
        endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
        
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
        
        events.push({
          title: eventTitle,
          description: "",
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: false,
          color: getRandomEventColor(),
          isAIGenerated: true,
          recurrence: {
            frequency: "weekly",
            interval: 1,
            count: 12 // Repeat for 12 weeks by default
          }
        });
      });
    } else if (recurrenceType === "monthly") {
      // For monthly recurrence
      const eventDate = new Date(currentDate);
      const timePattern = timeMatches[0];
      
      const startDate = new Date(eventDate);
      startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
      
      const endDate = new Date(eventDate);
      endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
      
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      events.push({
        title: eventTitle,
        description: "",
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: false,
        color: getRandomEventColor(),
        isAIGenerated: true,
        recurrence: {
          frequency: "monthly",
          interval: 1,
          count: 12 // Repeat for 12 months by default
        }
      });
    } else if (recurrenceType === "yearly") {
      // For yearly recurrence
      const eventDate = new Date(currentDate);
      const timePattern = timeMatches[0];
      
      const startDate = new Date(eventDate);
      startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
      
      const endDate = new Date(eventDate);
      endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
      
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      events.push({
        title: eventTitle,
        description: "",
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: false,
        color: getRandomEventColor(),
        isAIGenerated: true,
        recurrence: {
          frequency: "yearly",
          interval: 1,
          count: 5 // Repeat for 5 years by default
        }
      });
    }
  }

  // If no events were created (unlikely with our fallbacks), create a generic event
  if (events.length === 0) {
    const startDate = new Date(currentDate);
    startDate.setHours(9, 0, 0, 0);
    
    const endDate = new Date(currentDate);
    endDate.setHours(10, 0, 0, 0);
    
    events.push({
      title: eventTitle || "New Event",
      description: "",
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: false,
      color: getRandomEventColor(),
      isAIGenerated: true
    });
  }

  return events;
}

function extractEventTitle(details: string) {
  // Try to extract a meaningful title from the details
  // Remove time patterns, day references, and recurrence patterns
  const withoutTimes = details.replace(/\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)?/g, '');
  const withoutDays = withoutTimes.replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/gi, '');
  const withoutRecurrence = withoutDays.replace(/\b(every\s*day|daily|weekly|monthly|yearly|annually)\b/gi, '');
  const withoutDates = withoutRecurrence.replace(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/g, '');
  
  // Look for common event keywords and extract phrases around them
  const eventKeywords = [
    "meeting", "appointment", "class", "workout", "gym", "lunch", "dinner", 
    "breakfast", "coffee", "call", "interview", "doctor", "dentist", 
    "date", "party", "birthday", "anniversary", "conference", "presentation", 
    "exam", "study", "lecture", "flight", "train", "concert", "game", "match", 
    "festival", "holiday", "vacation", "trip", "visit", "session", "event"
  ];
  
  for (const keyword of eventKeywords) {
    if (withoutDates.toLowerCase().includes(keyword)) {
      // Extract a phrase around the keyword
      const regex = new RegExp(`\\b([\\w\\s]{0,20}\\s*${keyword}\\s*[\\w\\s]{0,20})\\b`, 'i');
      const match = withoutDates.match(regex);
      if (match) {
        // Clean up the match and capitalize it
        return match[0].trim().replace(/\s+/g, ' ').replace(/^\w/, c => c.toUpperCase());
      }
    }
  }
  
  // If no keyword found, look for verbs that might indicate an activity
  const activityVerbs = ["go", "have", "attend", "visit", "meet", "see", "watch", "play"];
  
  for (const verb of activityVerbs) {
    if (withoutDates.toLowerCase().includes(verb)) {
      // Extract a phrase around the verb
      const regex = new RegExp(`\\b(${verb}\\s+[\\w\\s]{1,20})\\b`, 'i');
      const match = withoutDates.match(regex);
      if (match) {
        return match[0].trim().replace(/\s+/g, ' ').replace(/^\w/, c => c.toUpperCase());
      }
    }
  }
  
  // If still no good title, use a cleaned-up version of the first portion
  const cleanDetails = withoutDates.trim().replace(/\s+/g, ' ');
  if (cleanDetails.length > 0) {
    const words = cleanDetails.split(' ');
    const titleWords = words.slice(0, 4);
    return titleWords.join(' ').replace(/^\w/, c => c.toUpperCase());
  }
  
  // Last resort - just return a generic title
  return "New Event";
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
