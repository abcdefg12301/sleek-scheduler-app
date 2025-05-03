
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

    // Use the AI model to generate calendar events based on natural language input
    const events = await generateEventsWithAI(calendarDetails);
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

// Use the Microsoft AI model to interpret and generate calendar events
async function generateEventsWithAI(userInput: string) {
  try {
    // Current date information for context
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // IMPROVED SYSTEM PROMPT - More precise instructions for better extraction
    const systemPrompt = `
You are an AI assistant specializing in creating calendar events from natural language instructions.
Your ONLY task is to convert the user's input into properly structured calendar events.

For example, if the user says "I go to the gym from 5pm-7pm every day", you should extract:
- Title: "Gym Workout" (descriptive of the activity)
- Time: 5pm to 7pm (17:00 to 19:00 in 24-hour format)
- Recurrence: daily

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON array where each object represents one event with these exact fields:
- title: String (preserve the original wording like "go to the gym" rather than simplifying to "Gym")
- description: String (additional context if any, otherwise empty string)
- start: String (ISO datetime with the EXACT time mentioned, e.g. "2025-05-03T17:00:00.000Z")
- end: String (ISO datetime with the EXACT end time mentioned, e.g. "2025-05-03T19:00:00.000Z")
- allDay: Boolean (true if it's an all-day event)
- recurrence: Object (null if not recurring) with:
  - frequency: String (daily, weekly, monthly, yearly)
  - interval: Number (default 1)
  - daysOfWeek: Array of numbers (0-6, where 0 is Sunday) if applicable

CRITICAL RULES:
1. PRESERVE THE FULL EVENT DESCRIPTION in the title (e.g., "go to the gym" not just "gym")
2. USE THE EXACT TIMES mentioned in the input (5pm becomes 17:00, not any other time)
3. If a time range is specified (like "5pm-7pm"), use those PRECISE times
4. For recurring events with specific days (like "Monday, Wednesday, Friday"), create separate events for each day
5. Do NOT make up information that isn't in the input
6. If no time is specified but an activity clearly has a typical time, you may suggest a reasonable time
7. If recurring patterns are mentioned (like "every day" or "weekdays"), set the appropriate recurrence pattern

Today is ${currentDate}, ${currentDay} and the current time is ${currentTime}.
`;

    // User input is the calendar details provided
    const userPrompt = userInput;

    // Make request to the AI model
    const response = await fetch("https://api.aiinfra.co.uk/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "microsoft/mai-ds-r1:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2, // Lower temperature for more consistent outputs
        max_tokens: 2048  // Allow enough tokens for detailed calendar events
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("AI model error:", data);
      throw new Error("Failed to process with AI model");
    }

    // Extract the AI response content
    const aiResponse = data.choices[0].message.content;
    console.log("AI response:", aiResponse);
    
    // Try to parse the JSON response from the AI
    let parsedEvents;
    try {
      // Handle potential text before or after the JSON
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      parsedEvents = JSON.parse(jsonStr);
      
      // Process the events to ensure proper formatting
      return processAIGeneratedEvents(parsedEvents);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      // Fallback to simple event creation if AI parsing fails
      return [createDefaultEvent(userInput)];
    }
  } catch (error) {
    console.error("Error in AI event generation:", error);
    // Fallback to simple event creation
    return [createDefaultEvent(userInput)];
  }
}

// Process and standardize AI-generated events
function processAIGeneratedEvents(events) {
  const currentDate = new Date();
  
  return events.map(event => {
    try {
      // Ensure start and end are proper dates
      let start, end;
      
      // Handle different date formats or create reasonable defaults
      if (event.start) {
        start = new Date(event.start);
        if (isNaN(start.getTime())) {
          // If invalid date, create a default
          start = new Date(currentDate);
          start.setHours(9, 0, 0, 0);
        }
      } else {
        start = new Date(currentDate);
        start.setHours(9, 0, 0, 0);
      }
      
      if (event.end) {
        end = new Date(event.end);
        if (isNaN(end.getTime())) {
          // If invalid date, make it 1 hour after start
          end = new Date(start);
          end.setHours(start.getHours() + 1);
        }
      } else {
        // Default to 1 hour duration
        end = new Date(start);
        end.setHours(start.getHours() + 1);
      }
      
      // Convert days of week to proper format if needed
      let recurrence = null;
      if (event.recurrence) {
        recurrence = {
          frequency: event.recurrence.frequency || "weekly",
          interval: event.recurrence.interval || 1
        };
      }
      
      return {
        title: event.title || "Untitled Event",
        description: event.description || "",
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: event.allDay || false,
        color: getRandomEventColor(),
        isAIGenerated: true,
        recurrence
      };
    } catch (error) {
      console.error("Error processing AI event:", error, event);
      return createDefaultEvent("Event");
    }
  });
}

// Create a default event as a fallback
function createDefaultEvent(text) {
  const title = text.split('.')[0].substring(0, 30) || "Event";
  
  const startDate = new Date();
  startDate.setHours(9, 0, 0, 0);
  
  const endDate = new Date();
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
