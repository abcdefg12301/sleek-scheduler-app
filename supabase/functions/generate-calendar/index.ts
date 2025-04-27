
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
  // This is a simple parser that tries to identify event patterns in the text
  // In a real implementation, this would use a more sophisticated NLP model
  const events = [];
  const currentDate = new Date();
  
  // Regex patterns for common time formats
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?(?:\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?)?/g;
  const weekdayRegex = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/gi;
  const everydayRegex = /\b(every\s*day|daily)\b/gi;
  
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
  
  // Check if event repeats every day
  const isEveryDay = everydayRegex.test(details);
  if (isEveryDay) {
    recurringDays = [0, 1, 2, 3, 4, 5, 6]; // All days of the week
  }

  // If no specific days were found, default to today
  if (!recurringDays.length) {
    recurringDays = [currentDate.getDay()];
  }

  // Look for time patterns
  let matchTime;
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
      
      // Create a base event from the detected time
      const eventTitle = extractEventTitle(details);
      
      // Generate events for each recurring day
      recurringDays.forEach(dayOfWeek => {
        // Find the next occurrence of this day of the week
        let eventDate = new Date(currentDate);
        while (eventDate.getDay() !== dayOfWeek) {
          eventDate.setDate(eventDate.getDate() + 1);
        }
        
        // Create start and end dates for the event
        const startDate = new Date(eventDate);
        startDate.setHours(startTime.hour, startTime.minute, 0, 0);
        
        const endDate = new Date(eventDate);
        endDate.setHours(endTime.hour, endTime.minute, 0, 0);
        
        // Handle case where end time is earlier than start time (next day)
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
        
        // Create the event object
        events.push({
          title: eventTitle,
          description: `AI generated event based on: "${details}"`,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: false,
          color: getRandomEventColor(),
          isAIGenerated: true,
          recurrence: recurringDays.length > 0 ? {
            frequency: "weekly",
            interval: 1,
            count: 12 // Repeat for 12 weeks by default
          } : undefined
        });
      });
    }
  }
  
  // If no specific times were found, create a default event
  if (events.length === 0) {
    const eventTitle = extractEventTitle(details);
    const startDate = new Date(currentDate);
    startDate.setHours(9, 0, 0, 0); // Default to 9 AM
    
    const endDate = new Date(currentDate);
    endDate.setHours(10, 0, 0, 0); // Default to 10 AM
    
    events.push({
      title: eventTitle,
      description: `AI generated event based on: "${details}"`,
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
  // First, remove time patterns
  const withoutTimes = details.replace(/\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)?/g, '');
  // Remove day references
  const withoutDays = withoutTimes.replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/gi, '');
  // Remove "every day" and similar phrases
  const withoutRecurrence = withoutDays.replace(/\b(every\s*day|daily|weekly|monthly)\b/gi, '');
  
  // Look for common event keywords
  const eventKeywords = ["meeting", "appointment", "class", "workout", "gym", "lunch", "dinner", "breakfast", "coffee", "call", "interview"];
  
  for (const keyword of eventKeywords) {
    if (details.toLowerCase().includes(keyword)) {
      // Extract a phrase around the keyword (simple approach)
      const regex = new RegExp(`\\b\\w*\\s*${keyword}\\s*\\w*\\b`, 'i');
      const match = details.match(regex);
      if (match) return match[0].charAt(0).toUpperCase() + match[0].slice(1);
    }
  }
  
  // If no keyword found, use a cleaned-up version of the details
  const cleanDetails = withoutRecurrence.trim().replace(/\s+/g, ' ');
  if (cleanDetails.length > 5) {
    // Use the first few words if there's enough content
    const words = cleanDetails.split(' ');
    return (words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '')).charAt(0).toUpperCase() + 
           (words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '')).slice(1);
  }
  
  // Fallback to generic title with the first word capitalized
  return details.split(' ')[0].charAt(0).toUpperCase() + details.split(' ')[0].slice(1) + " Event";
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
