
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
  // Break the input into potential separate events
  const events = [];
  const currentDate = new Date();
  
  // Split the input by common separators that might indicate different events
  const eventTexts = splitIntoEventTexts(details);
  
  // Check if this is a schedule generation request
  const isScheduleGeneration = details.toLowerCase().includes('schedule') || 
                             details.toLowerCase().includes('generate') || 
                             details.toLowerCase().includes('create a') ||
                             details.toLowerCase().includes('plan');
  
  // Process each potential event text
  for (const eventText of eventTexts) {
    const parsedEvents = parseEventText(eventText, currentDate);
    events.push(...parsedEvents);
  }
  
  // If this is a schedule generation request and we didn't find many events, create a schedule
  if (isScheduleGeneration && events.length < 3) {
    const scheduleEvents = generateSchedule(details, currentDate, events);
    events.push(...scheduleEvents);
  }
  
  // If no events were detected, create at least one default event
  if (events.length === 0) {
    const defaultEvent = createDefaultEvent(details, currentDate);
    events.push(defaultEvent);
  }
  
  return events;
}

// Helper function to split input text into potential separate events
function splitIntoEventTexts(text: string) {
  // Remove any "generate" or "create" prefixes
  const cleanedText = text.replace(/^(please |can you |)?(generate|create) (me )?(a |an |some )?/i, '');
  
  // Split by common separators
  const segments = cleanedText.split(/(?:,\s*and\s*|\.\s*|\n+|\s+and\s+|;\s*)/);
  
  // Filter out empty segments and trim each segment
  return segments
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0);
}

function parseEventText(text: string, baseDate: Date) {
  const events = [];
  
  // IMPROVED TIME EXTRACTION: Better regex patterns for common time and date formats
  // Time range pattern like "5pm-7pm" or "5:30 PM to 7:00 PM"
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?(?:\s*[-–—to]+\s*)(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/g;
  
  // Single time mention like "at 3pm" or "starts at 3:30"
  const singleTimeRegex = /(?:at|from|starting|starts?(?:\s+at)?)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)/gi;
  
  const weekdayRegex = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/gi;
  const everydayRegex = /\b(every\s*day|daily)\b/gi;
  const weeklyRegex = /\b(every\s*week|weekly)\b/gi;
  const monthlyRegex = /\b(every\s*month|monthly)\b/gi;
  const yearlyRegex = /\b(every\s*year|yearly|annually)\b/gi;
  const specificDateRegex = /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/g;
  const noRepeatIndicators = /\b(only|once|one-time|single)\b/gi;
  
  // Schedule pattern indicators
  const scheduleRegex = /\b(schedule|fit in|add to|include in)\b/gi;
  const timeConstraintRegex = /\b(after|before|between)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/gi;
  
  // Activity keywords to help with title extraction
  const activityKeywords = [
    "gym", "workout", "exercise", "training", "fitness",
    "meeting", "call", "conference", "zoom", "webinar",
    "class", "lecture", "study", "studying", "read", "reading", "exam", "test", "quiz",
    "doctor", "dentist", "appointment", "checkup", "therapy", "consultation",
    "lunch", "dinner", "breakfast", "coffee", "meal", "snack", "eat", "eating",
    "shopping", "grocery", "errands", "chores", "cleaning",
    "sleep", "rest", "nap", "relaxation",
    "work", "job", "shift", "project", "task", "deadline",
    "party", "celebration", "birthday", "anniversary", "event",
    "game", "match", "practice", "rehearsal", "perform", "performance",
    "flight", "train", "bus", "drive", "commute", "travel", "trip",
    "vacation", "holiday", "trip", "visit", "tour"
  ];
  
  // IMPROVED TITLE EXTRACTION: Extract title using enhanced methods that preserve the original wording
  const eventTitle = extractEventTitle(text, activityKeywords);
  
  // Check for specific date patterns
  let specificDate: Date | null = null;
  let specificDateMatch;
  const dateMatches = [];
  
  while ((specificDateMatch = specificDateRegex.exec(text)) !== null) {
    const month = parseInt(specificDateMatch[1], 10) - 1; // 0-indexed months
    const day = parseInt(specificDateMatch[2], 10);
    let year = specificDateMatch[3] ? parseInt(specificDateMatch[3], 10) : baseDate.getFullYear();
    
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
  while ((matchWeekday = weekdayRegex.exec(text)) !== null) {
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
    
    if (dayMap[day] !== undefined && !recurringDays.includes(dayMap[day])) {
      recurringDays.push(dayMap[day]);
    }
  }
  
  // Determine recurrence pattern
  let recurrenceType = null;
  let noRepeat = noRepeatIndicators.test(text);
  
  if (specificDate !== null || noRepeat) {
    recurrenceType = "none"; // One-time event
  } else if (everydayRegex.test(text)) {
    recurrenceType = "daily";
    recurringDays = []; // No need for specific days with daily recurrence
  } else if (weeklyRegex.test(text)) {
    recurrenceType = "weekly";
    // If no specific days mentioned, default to today
    if (recurringDays.length === 0) {
      recurringDays = [baseDate.getDay()];
    }
  } else if (monthlyRegex.test(text)) {
    recurrenceType = "monthly";
  } else if (yearlyRegex.test(text)) {
    recurrenceType = "yearly";
  } else if (recurringDays.length > 0) {
    // If we found specific days but no explicit recurrence pattern
    recurrenceType = "weekly";
  } else {
    // Default case - if we can't determine recurrence pattern
    // and there are no specific dates, assume it's a one-time event
    recurrenceType = "none";
  }

  // IMPROVED TIME EXTRACTION: Look for time patterns
  let timeMatches = [];
  let matchTime;
  
  // First try to find time ranges like "5pm-7pm" with improved regex
  while ((matchTime = timeRegex.exec(text)) !== null) {
    const startHour = matchTime[1];
    const startMinute = matchTime[2] || "00";
    const startAmpm = matchTime[3] || "";
    
    const endHour = matchTime[4];
    const endMinute = matchTime[5] || "00";
    const endAmpm = matchTime[6] || startAmpm;
    
    if (startHour) {
      const startTime = parseTime(startHour, startMinute, startAmpm);
      const endTime = parseTime(endHour, endMinute, endAmpm);
      
      // IMPROVED: Store the original time text for better title generation
      timeMatches.push({ 
        start: startTime, 
        end: endTime,
        originalText: matchTime[0] 
      });
    }
  }
  
  // If no time range was found, check for single time mentions like "at 3pm"
  if (timeMatches.length === 0) {
    let singleTimeMatch;
    while ((singleTimeMatch = singleTimeRegex.exec(text)) !== null) {
      const hour = singleTimeMatch[1];
      const minute = singleTimeMatch[2] || "00";
      const ampm = singleTimeMatch[3] || "";
      
      if (hour) {
        const startTime = parseTime(hour, minute, ampm);
        // Default duration: 1 hour
        const endTime = {
          hour: (startTime.hour + 1) % 24,
          minute: startTime.minute
        };
        
        timeMatches.push({ 
          start: startTime, 
          end: endTime,
          originalText: singleTimeMatch[0] 
        });
      }
    }
  }
  
  // Check for schedule constraints
  let scheduleConstraints = null;
  if (scheduleRegex.test(text)) {
    scheduleConstraints = extractTimeConstraints(text);
  }
  
  // If no specific times were found but we have schedule constraints, generate times
  if (timeMatches.length === 0 && scheduleConstraints) {
    const generatedTimes = generateTimeSlots(scheduleConstraints, recurrenceType === "daily");
    timeMatches = generatedTimes.map(time => ({
      ...time,
      originalText: `between ${formatTimeForDisplay(time.start)} and ${formatTimeForDisplay(time.end)}`
    }));
  }
  
  // If still no specific times were found, create a default time that makes sense for the activity
  if (timeMatches.length === 0) {
    // IMPROVED: Use activity-based default times instead of fixed defaults
    const defaultTime = getDefaultTimeForActivity(eventTitle.toLowerCase(), recurrenceType);
    
    timeMatches.push({
      start: defaultTime.start,
      end: defaultTime.end,
      originalText: `around ${formatTimeForDisplay(defaultTime.start)}`
    });
  }
  
  // Generate events based on the extracted patterns
  if (recurrenceType === "none" || specificDate !== null) {
    // Create a one-time event
    const eventDate = specificDate || new Date(baseDate);
    
    // Use each time pattern found to create separate events
    timeMatches.forEach(timePattern => {
      // Create start and end dates
      const startDate = new Date(eventDate);
      startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
      
      const endDate = new Date(eventDate);
      endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
      
      // Handle case where end time is earlier than start time (next day)
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      // IMPROVED TITLE GENERATION: Create a better event title that includes accurate time info
      const betterTitle = createAccurateEventTitle(eventTitle, timePattern.originalText);
      
      // Create the event object
      events.push({
        title: betterTitle,
        description: "",
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: false,
        color: getRandomEventColor(),
        isAIGenerated: true
        // No recurrence for one-time events
      });
    });
  } else {
    // Handle recurring events differently based on the type
    if (recurrenceType === "daily") {
      // For daily events, create one event with daily recurrence
      const eventDate = new Date(baseDate);
      
      // For each time slot (if multiple were mentioned)
      timeMatches.forEach(timePattern => {
        const startDate = new Date(eventDate);
        startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
        
        const endDate = new Date(eventDate);
        endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
        
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
        
        // IMPROVED TITLE GENERATION
        const betterTitle = createAccurateEventTitle(eventTitle, timePattern.originalText);
        
        events.push({
          title: betterTitle,
          description: "",
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: false,
          color: getRandomEventColor(),
          isAIGenerated: true,
          recurrence: {
            frequency: "daily",
            interval: 1
          }
        });
      });
    } else if (recurrenceType === "weekly") {
      // For weekly recurrence with specific days
      if (recurringDays.length > 0) {
        // Create one weekly recurring event per day of the week specified
        recurringDays.forEach(dayOfWeek => {
          // Find the next occurrence of this day of the week
          let eventDate = new Date(baseDate);
          const currentDay = eventDate.getDay();
          
          // Calculate days to add to get to the target day
          let daysToAdd = dayOfWeek - currentDay;
          if (daysToAdd < 0) daysToAdd += 7;
          eventDate.setDate(eventDate.getDate() + daysToAdd);
          
          // For each time slot (if multiple were mentioned)
          timeMatches.forEach(timePattern => {
            const startDate = new Date(eventDate);
            startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
            
            const endDate = new Date(eventDate);
            endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
            
            if (endDate < startDate) {
              endDate.setDate(endDate.getDate() + 1);
            }
            
            // IMPROVED TITLE GENERATION
            const betterTitle = createAccurateEventTitle(eventTitle, timePattern.originalText);
            
            events.push({
              title: betterTitle,
              description: "",
              start: startDate.toISOString(),
              end: endDate.toISOString(),
              allDay: false,
              color: getRandomEventColor(),
              isAIGenerated: true,
              recurrence: {
                frequency: "weekly",
                interval: 1
              }
            });
          });
        });
      } else {
        // Weekly recurrence without specific days (use current day)
        const eventDate = new Date(baseDate);
        
        // For each time slot (if multiple were mentioned)
        timeMatches.forEach(timePattern => {
          const startDate = new Date(eventDate);
          startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
          
          const endDate = new Date(eventDate);
          endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
          
          if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
          }
          
          // IMPROVED TITLE GENERATION
          const betterTitle = createAccurateEventTitle(eventTitle, timePattern.originalText);
          
          events.push({
            title: betterTitle,
            description: "",
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            allDay: false,
            color: getRandomEventColor(),
            isAIGenerated: true,
            recurrence: {
              frequency: "weekly",
              interval: 1
            }
          });
        });
      }
    } else if (recurrenceType === "monthly") {
      // For monthly recurrence
      const eventDate = new Date(baseDate);
      
      // For each time slot (if multiple were mentioned)
      timeMatches.forEach(timePattern => {
        const startDate = new Date(eventDate);
        startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
        
        const endDate = new Date(eventDate);
        endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
        
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
        
        // IMPROVED TITLE GENERATION
        const betterTitle = createAccurateEventTitle(eventTitle, timePattern.originalText);
        
        events.push({
          title: betterTitle,
          description: "",
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: false,
          color: getRandomEventColor(),
          isAIGenerated: true,
          recurrence: {
            frequency: "monthly",
            interval: 1
          }
        });
      });
    } else if (recurrenceType === "yearly") {
      // For yearly recurrence
      const eventDate = new Date(baseDate);
      
      // For each time slot (if multiple were mentioned)
      timeMatches.forEach(timePattern => {
        const startDate = new Date(eventDate);
        startDate.setHours(timePattern.start.hour, timePattern.start.minute, 0, 0);
        
        const endDate = new Date(eventDate);
        endDate.setHours(timePattern.end.hour, timePattern.end.minute, 0, 0);
        
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
        
        // IMPROVED TITLE GENERATION
        const betterTitle = createAccurateEventTitle(eventTitle, timePattern.originalText);
        
        events.push({
          title: betterTitle,
          description: "",
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: false,
          color: getRandomEventColor(),
          isAIGenerated: true,
          recurrence: {
            frequency: "yearly",
            interval: 1
          }
        });
      });
    }
  }

  return events;
}

// IMPROVED: Format time for display in titles
function formatTimeForDisplay(time: { hour: number, minute: number }) {
  const h = time.hour % 12 || 12;
  const period = time.hour >= 12 ? 'PM' : 'AM';
  const m = time.minute === 0 ? '' : `:${time.minute.toString().padStart(2, '0')}`;
  return `${h}${m} ${period}`;
}

// NEW HELPER: Create a more accurate event title that includes time information
function createAccurateEventTitle(baseTitle: string, timeText: string) {
  // If the base title already includes time-related text, use it as is
  if (/\d+(:\d+)?\s*(am|pm|AM|PM)/.test(baseTitle)) {
    return baseTitle;
  }
  
  // For gym-related activities, include the time in the title
  if (/\b(gym|workout|exercise|training|fitness)\b/i.test(baseTitle.toLowerCase())) {
    // Extract just the time part from timeText (e.g., "5pm-7pm" from "from 5pm-7pm")
    const simpleTimeMatch = timeText.match(/(\d+(?::\d+)?\s*(?:am|pm)(?:\s*[-–—to]+\s*\d+(?::\d+)?\s*(?:am|pm))?)/i);
    const simpleTime = simpleTimeMatch ? simpleTimeMatch[1] : timeText;
    
    return baseTitle;
  }
  
  return baseTitle;
}

// IMPROVED: Helper to parse and standardize time with better defaults
function parseTime(hour: string, minute: string = "00", ampm: string = "") {
  let h = parseInt(hour, 10);
  const m = parseInt(minute || "0", 10);
  
  // Handle 12-hour format if AM/PM is provided
  if (ampm && ampm.toLowerCase()) {
    const isPM = ampm.toLowerCase() === "pm";
    
    // 12 AM -> 0, 1-11 AM -> 1-11
    if (!isPM && h === 12) h = 0;
    // 12 PM -> 12, 1-11 PM -> 13-23
    else if (isPM && h < 12) h += 12;
  } else if (h < 12) {
    // If no AM/PM is provided, make a smart guess based on typical daily patterns
    
    // Morning hours (7-11) stay as AM
    if (h >= 7 && h < 12) {
      // Keep as is, assuming AM
    } 
    // Late night/early morning (0-6) stay as AM
    else if (h >= 0 && h < 7) {
      // Keep as is, assuming AM
    }
    // Afternoon/evening hours (1-6) are likely PM
    else {
      h += 12;  // Convert to PM
    }
  }
  
  return { hour: h, minute: m };
}

// NEW HELPER: Provide default times based on activity types
function getDefaultTimeForActivity(activity: string, recurrenceType: string) {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Workout/gym is typically morning or evening
  if (/\b(gym|workout|exercise|training|fitness)\b/i.test(activity)) {
    // Morning workout (6-8 AM) or evening workout (5-7 PM)
    if (currentHour < 12) {
      return { start: { hour: 6, minute: 0 }, end: { hour: 8, minute: 0 } };
    } else {
      return { start: { hour: 17, minute: 0 }, end: { hour: 19, minute: 0 } };
    }
  }
  
  // Meals
  if (/\b(breakfast)\b/i.test(activity)) {
    return { start: { hour: 8, minute: 0 }, end: { hour: 9, minute: 0 } };
  }
  
  if (/\b(lunch)\b/i.test(activity)) {
    return { start: { hour: 12, minute: 0 }, end: { hour: 13, minute: 0 } };
  }
  
  if (/\b(dinner)\b/i.test(activity)) {
    return { start: { hour: 18, minute: 0 }, end: { hour: 19, minute: 0 } };
  }
  
  // Meetings usually during business hours
  if (/\b(meeting|call|conference|appointment)\b/i.test(activity)) {
    // During business hours (9 AM - 5 PM)
    const businessHour = Math.max(9, Math.min(16, currentHour));
    return { 
      start: { hour: businessHour, minute: 0 }, 
      end: { hour: businessHour + 1, minute: 0 } 
    };
  }
  
  // Default to a reasonable time based on current time
  if (currentHour >= 8 && currentHour <= 17) {
    // During waking hours, schedule for the next hour
    const nextHour = (currentHour + 1) % 24;
    return { 
      start: { hour: nextHour, minute: 0 }, 
      end: { hour: (nextHour + 1) % 24, minute: 0 } 
    };
  } else {
    // Default to 9 AM for early morning or late night current time
    return { start: { hour: 9, minute: 0 }, end: { hour: 10, minute: 0 } };
  }
}

// Function to extract meaningful event title
function extractEventTitle(text: string, activityKeywords: string[]) {
  // IMPROVED TITLE EXTRACTION: Multiple approaches to find the best title
  
  // 1. Look for phrases with action verbs followed by an activity
  const actionActivityPattern = /\b(?:go to|have|attend|do|work on|participate in)\s+(?:the\s+)?(\w+(?:\s+\w+)*)/i;
  const actionActivityMatch = text.match(actionActivityPattern);
  if (actionActivityMatch && actionActivityMatch[1].length > 2) {
    // Extract and clean up the found activity
    const activity = actionActivityMatch[1].replace(/\s+at\s+.*/i, '').trim();
    
    // If the activity is followed by a time description, remove it from the title
    const activityWithoutTime = activity.replace(/\s+\d+(?::\d+)?\s*(?:am|pm|AM|PM).*/i, '').trim();
    
    return activityWithoutTime.charAt(0).toUpperCase() + activityWithoutTime.slice(1).toLowerCase();
  }

  // 2. Look for common activity keywords
  for (const keyword of activityKeywords) {
    // Look for direct matches of the keyword
    const regexPattern = new RegExp(`\\b(${keyword}(?:\\s+\\w+)*)\\b`, 'i');
    const match = text.match(regexPattern);
    if (match) {
      // Clean up the found activity
      const activity = match[0].replace(/\s+at\s+.*/i, '').trim();
      const activityWithoutTime = activity.replace(/\s+\d+(?::\d+)?\s*(?:am|pm|AM|PM).*/i, '').trim();
      return activityWithoutTime.charAt(0).toUpperCase() + activityWithoutTime.slice(1).toLowerCase();
    }
  }
  
  // 3. Look for phrases like "X session" or "X class"
  const sessionPattern = /\b(\w+)\s+(session|class|appointment|meeting|event|time)\b/i;
  const sessionMatch = text.match(sessionPattern);
  if (sessionMatch) {
    return sessionMatch[1].charAt(0).toUpperCase() + sessionMatch[1].slice(1).toLowerCase();
  }
  
  // 4. Try to extract a meaningful noun phrase
  const nounPhrases = extractPotentialNounPhrases(text);
  if (nounPhrases.length > 0) {
    for (const phrase of nounPhrases) {
      if (phrase.length > 2 && !["the", "and", "but", "for", "with"].includes(phrase.toLowerCase())) {
        // Remove any time-related info from the phrase
        const phraseWithoutTime = phrase.replace(/\s+\d+(?::\d+)?\s*(?:am|pm|AM|PM).*/i, '').trim();
        return phraseWithoutTime.charAt(0).toUpperCase() + phraseWithoutTime.slice(1).toLowerCase();
      }
    }
  }
  
  // 5. Default case: first word that's not a common word
  const words = text.split(/\s+/);
  const commonWords = ["i", "me", "my", "we", "our", "the", "a", "an", "want", "need", "would", "like", "every", "each", "on", "at", "in"];
  
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, "").toLowerCase();
    if (cleanWord.length > 2 && !commonWords.includes(cleanWord)) {
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
    }
  }
  
  // Final fallback
  return "Event";
}

// Simple noun phrase extractor
function extractPotentialNounPhrases(text: string) {
  const phrases = [];
  
  // Remove common prefixes like "I want", "I need", etc.
  const cleanedText = text.replace(/^(i|we) (want|need|would like|have|go to|attend|do)/i, "");
  
  // Split by common delimiters
  const segments = cleanedText.split(/[,.\s]+/);
  
  // Look for words that are likely nouns (not starting with common articles/prepositions)
  const skipWords = ["the", "a", "an", "to", "at", "in", "on", "with", "by", "and", "but", "or", "from"];
  
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] && !skipWords.includes(segments[i].toLowerCase())) {
      phrases.push(segments[i]);
    }
  }
  
  return phrases;
}

// Extract time constraints for scheduling
function extractTimeConstraints(text: string) {
  const constraints = {
    earliestHour: 9, // Default 9 AM
    latestHour: 17,  // Default 5 PM
  };
  
  // Look for "after X" pattern
  const afterRegex = /\b(?:after|from|starting|start)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\b/i;
  const afterMatch = text.match(afterRegex);
  if (afterMatch) {
    const time = parseTime(afterMatch[1], afterMatch[2], afterMatch[3]);
    constraints.earliestHour = time.hour;
  }
  
  // Look for "before X" pattern
  const beforeRegex = /\b(?:before|until|till|by|ending|end at)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\b/i;
  const beforeMatch = text.match(beforeRegex);
  if (beforeMatch) {
    const time = parseTime(beforeMatch[1], beforeMatch[2], beforeMatch[3]);
    constraints.latestHour = time.hour;
  }
  
  return constraints;
}

// Generate appropriate time slots based on constraints
function generateTimeSlots(constraints: { earliestHour: number, latestHour: number }, isDaily: boolean) {
  const slots = [];
  const { earliestHour, latestHour } = constraints;
  
  // Determine how many slots to generate
  let slotsCount = 1; // Default to one slot
  if (isDaily) {
    // For daily recurring events, generate slots based on available time
    const hoursAvailable = latestHour - earliestHour;
    slotsCount = Math.max(1, Math.min(3, Math.floor(hoursAvailable / 2))); // Up to 3 slots, each at least 2 hours apart
  }
  
  // Generate evenly distributed slots
  const availableHours = latestHour - earliestHour;
  const slotDuration = Math.min(1.5, availableHours / (slotsCount * 2)); // In hours, default to 1.5 hour max
  
  for (let i = 0; i < slotsCount; i++) {
    const slotStartHour = earliestHour + (availableHours / (slotsCount + 1)) * (i + 1);
    
    const startHour = Math.floor(slotStartHour);
    const startMinute = Math.round((slotStartHour - startHour) * 60);
    
    const endHour = Math.floor(slotStartHour + slotDuration);
    const endMinute = Math.round(((slotStartHour + slotDuration) - endHour) * 60);
    
    slots.push({
      start: { hour: startHour, minute: startMinute },
      end: { hour: endHour, minute: endMinute }
    });
  }
  
  return slots;
}

function createDefaultEvent(text: string, baseDate: Date) {
  const title = extractEventTitle(text, []);
  
  const startDate = new Date(baseDate);
  startDate.setHours(9, 0, 0, 0);
  
  const endDate = new Date(baseDate);
  endDate.setHours(10, 0, 0, 0);
  
  return {
    title,
    description: "",
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    allDay: false,
    color: getRandomEventColor(),
    isAIGenerated: true
  };
}

// New function to generate a study/work schedule based on constraints
function generateSchedule(text: string, baseDate: Date, existingEvents: any[]) {
  const events = [];
  const scheduleType = determineScheduleType(text);
  const constraints = extractTimeConstraints(text);
  
  // Check for sleep schedule mentions
  const sleepStartRegex = /\b(?:sleep|bed|rest)(?:ing)?\s+(?:at|from|starting|around)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\b/i;
  const sleepStartMatch = text.match(sleepStartRegex);
  if (sleepStartMatch) {
    const time = parseTime(sleepStartMatch[1], sleepStartMatch[2], sleepStartMatch[3]);
    constraints.latestHour = time.hour;
  }
  
  // We'll create different types of schedules based on what was requested
  switch (scheduleType) {
    case 'study':
      events.push(...createStudySchedule(constraints, baseDate));
      break;
    case 'workout':
      events.push(...createWorkoutSchedule(constraints, baseDate));
      break;
    case 'work':
      events.push(...createWorkSchedule(constraints, baseDate));
      break;
    default:
      events.push(...createGeneralSchedule(constraints, baseDate));
  }
  
  return events;
}

// Determine what kind of schedule is being requested
function determineScheduleType(text: string) {
  text = text.toLowerCase();
  
  if (text.includes('study') || text.includes('studying') || text.includes('learn') || 
      text.includes('read') || text.includes('course') || text.includes('class')) {
    return 'study';
  }
  
  if (text.includes('workout') || text.includes('exercise') || text.includes('gym') || 
      text.includes('training') || text.includes('fitness')) {
    return 'workout';
  }
  
  if (text.includes('work') || text.includes('job') || text.includes('project') || 
      text.includes('task') || text.includes('productive')) {
    return 'work';
  }
  
  return 'general';
}

// Create a study schedule
function createStudySchedule(constraints: { earliestHour: number, latestHour: number }, baseDate: Date) {
  const events = [];
  const { earliestHour, latestHour } = constraints;
  const availableHours = latestHour - earliestHour;
  
  // Create multiple study sessions throughout the week
  const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday
  const subjects = ['Math', 'Science', 'History', 'Languages', 'Programming'];
  
  daysOfWeek.forEach((day, index) => {
    // Find the next occurrence of this day of the week
    let eventDate = new Date(baseDate);
    const currentDay = eventDate.getDay();
    
    // Calculate days to add to get to the target day
    let daysToAdd = day - currentDay;
    if (daysToAdd < 0) daysToAdd += 7;
    eventDate.setDate(eventDate.getDate() + daysToAdd);
    
    // Create 1-2 study sessions per day
    const sessionsPerDay = availableHours >= 4 ? 2 : 1;
    
    for (let i = 0; i < sessionsPerDay; i++) {
      // Calculate start time - distribute throughout the available hours
      const startHour = Math.floor(earliestHour + (availableHours / (sessionsPerDay + 1)) * (i + 1));
      
      // Each session is 1-1.5 hours
      const sessionLength = 1 + (Math.random() > 0.5 ? 0.5 : 0);
      
      const startDate = new Date(eventDate);
      startDate.setHours(startHour, 0, 0, 0);
      
      const endDate = new Date(eventDate);
      endDate.setHours(startHour + sessionLength, sessionLength % 1 === 0 ? 0 : 30, 0, 0);
      
      // Assign a subject from the list, cycling through them
      const subjectIndex = (index + i) % subjects.length;
      
      events.push({
        title: `Study ${subjects[subjectIndex]}`,
        description: "",
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: false,
        color: getRandomEventColor(),
        isAIGenerated: true,
        recurrence: {
          frequency: "weekly",
          interval: 1
        }
      });
    }
  });
  
  return events;
}

// Create a workout schedule
function createWorkoutSchedule(constraints: { earliestHour: number, latestHour: number }, baseDate: Date) {
  const events = [];
  const { earliestHour, latestHour } = constraints;
  
  // Create a workout schedule 3-5 times per week
  const workoutDays = [1, 3, 5]; // Monday, Wednesday, Friday
  const workoutTypes = ['Strength Training', 'Cardio', 'Full Body Workout'];
  
  workoutDays.forEach((day, index) => {
    // Find the next occurrence of this day of the week
    let eventDate = new Date(baseDate);
    const currentDay = eventDate.getDay();
    
    // Calculate days to add to get to the target day
    let daysToAdd = day - currentDay;
    if (daysToAdd < 0) daysToAdd += 7;
    eventDate.setDate(eventDate.getDate() + daysToAdd);
    
    // Calculate start time - try to be consistent 
    const startHour = Math.floor((earliestHour + latestHour) / 2); // Middle of available time
    
    const startDate = new Date(eventDate);
    startDate.setHours(startHour, 0, 0, 0);
    
    const endDate = new Date(eventDate);
    endDate.setHours(startHour + 1, 0, 0, 0);
    
    // Cycle through workout types
    const workoutIndex = index % workoutTypes.length;
    
    events.push({
      title: workoutTypes[workoutIndex],
      description: "",
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: false,
      color: getRandomEventColor(),
      isAIGenerated: true,
      recurrence: {
        frequency: "weekly",
        interval: 1
      }
    });
  });
  
  return events;
}

// Create a work schedule
function createWorkSchedule(constraints: { earliestHour: number, latestHour: number }, baseDate: Date) {
  const events = [];
  const { earliestHour, latestHour } = constraints;
  
  // Create a work schedule for weekdays
  const workDays = [1, 2, 3, 4, 5]; // Monday through Friday
  
  workDays.forEach(day => {
    // Find the next occurrence of this day of the week
    let eventDate = new Date(baseDate);
    const currentDay = eventDate.getDay();
    
    // Calculate days to add to get to the target day
    let daysToAdd = day - currentDay;
    if (daysToAdd < 0) daysToAdd += 7;
    eventDate.setDate(eventDate.getDate() + daysToAdd);
    
    // Standard work hours (8 hours)
    const startHour = Math.max(earliestHour, 9); // Start no earlier than 9am by default
    const endHour = Math.min(latestHour, startHour + 8); // 8 hour workday
    
    const startDate = new Date(eventDate);
    startDate.setHours(startHour, 0, 0, 0);
    
    const endDate = new Date(eventDate);
    endDate.setHours(endHour, 0, 0, 0);
    
    events.push({
      title: "Work",
      description: "",
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: false,
      color: getRandomEventColor(),
      isAIGenerated: true,
      recurrence: {
        frequency: "weekly",
        interval: 1
      }
    });
  });
  
  return events;
}

// Create a general schedule with varied activities
function createGeneralSchedule(constraints: { earliestHour: number, latestHour: number }, baseDate: Date) {
  const events = [];
  const { earliestHour, latestHour } = constraints;
  const availableHours = latestHour - earliestHour;
  
  // Create a mix of different activities throughout the week
  const activities = [
    { title: "Exercise", duration: 1, days: [1, 3, 5] }, // M,W,F
    { title: "Reading", duration: 1, days: [2, 4, 6] },  // T,Th,Sa
    { title: "Personal Project", duration: 2, days: [6, 0] }, // Sa,Su
    { title: "Meal Prep", duration: 1.5, days: [0] } // Sunday
  ];
  
  activities.forEach(activity => {
    activity.days.forEach(day => {
      // Find the next occurrence of this day of the week
      let eventDate = new Date(baseDate);
      const currentDay = eventDate.getDay();
      
      // Calculate days to add to get to the target day
      let daysToAdd = day - currentDay;
      if (daysToAdd < 0) daysToAdd += 7;
      eventDate.setDate(eventDate.getDate() + daysToAdd);
      
      // Calculate a reasonable time within the constraints
      // Try to put longer activities when more time is available
      const startHour = Math.floor(earliestHour + (availableHours / 3)); // 1/3 into available time
      
      const startDate = new Date(eventDate);
      startDate.setHours(startHour, 0, 0, 0);
      
      const endDate = new Date(eventDate);
      endDate.setHours(startHour + activity.duration, activity.duration % 1 === 0 ? 0 : 30, 0, 0);
      
      events.push({
        title: activity.title,
        description: "",
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: false,
        color: getRandomEventColor(),
        isAIGenerated: true,
        recurrence: {
          frequency: "weekly",
          interval: 1
        }
      });
    });
  });
  
  return events;
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

