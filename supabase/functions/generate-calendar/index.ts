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
    const { calendarDetails, previousEvents = [] } = await req.json();
    console.log("Received request to generate calendar with details:", calendarDetails);
    console.log("Previous events context:", previousEvents.length > 0 ? `${previousEvents.length} events` : "None");

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
    const { events, sourceType, error } = await generateEventsWithAI(calendarDetails, previousEvents);
    
    if (error) {
      console.error("AI generation error:", error);
      return new Response(
        JSON.stringify({ 
          events,
          sourceType,
          error 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log("Generated events:", events);
    console.log("Source type:", sourceType);

    return new Response(
      JSON.stringify({ events, sourceType }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Error generating calendar:", error);
    return new Response(
      JSON.stringify({ 
        error: `Server error: ${error.message || "Unknown error"}`,
        events: [createDefaultEvent("Event")],
        sourceType: "fallback" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Use OpenRouter to connect to MistralAI model
async function generateEventsWithAI(userInput: string, previousEvents: any[] = []) {
  try {
    // Current date information for context - without time zones
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-US');
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Create a context from previous events if any
    let previousEventsContext = "";
    if (previousEvents && previousEvents.length > 0) {
      previousEventsContext = `\n\nYou MUST be aware of and avoid conflicts with the user's existing schedule:\n`;
      
      // Sort events by start time to make them easier to process
      const sortedEvents = [...previousEvents].sort((a, b) => {
        const startA = new Date(a.start).getTime();
        const startB = new Date(b.start).getTime();
        return startA - startB;
      });
      
      // Format the events in a more structured way
      sortedEvents.slice(0, 20).forEach((event, index) => { // Limit to 20 events to avoid token limits
        // Handle date formatting more consistently without time zones
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);

        // Format as simple time for consistency
        const formatSimpleDate = (date: Date) => {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        };
        
        const formatSimpleTime = (date: Date) => {
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });
        };
        
        previousEventsContext += `${index + 1}. "${event.title}" on ${formatSimpleDate(startDate)} from ${formatSimpleTime(startDate)} to ${formatSimpleTime(endDate)}`;
        if (event.recurrence) {
          previousEventsContext += ` (repeats ${event.recurrence.frequency})`;
        }
        previousEventsContext += "\n";
      });
      
      previousEventsContext += "\nYou MUST avoid scheduling events that overlap with these existing events.";
    }

    // System prompt for MistralAI
    const systemPrompt = `
You are an AI assistant specializing in creating calendar events from natural language instructions.
Your task is to convert user input into properly structured calendar events.

OUTPUT REQUIREMENTS:
Return a valid JSON array where each object represents one event with these exact fields:
- title: String (concise title that captures the essence of the event)
- description: String (additional context if any, otherwise empty string)
- start: String (ISO date string without timezone information, e.g. "2025-05-03T17:00:00")
- end: String (ISO date string without timezone information, e.g. "2025-05-03T19:00:00")
- allDay: Boolean (true if it's an all-day event)
- recurrence: Object (null if not recurring) with:
  - frequency: String (daily, weekly, monthly, yearly)
  - interval: Number (default 1)
  - daysOfWeek: Array of numbers (0-6, where 0 is Sunday) if applicable

CRITICAL TIME HANDLING RULES:
1. DO NOT USE TIMEZONES AT ALL. Work with local times only.
2. Output all date times in ISO format WITHOUT 'Z' at the end and WITHOUT timezone offsets.
3. When a specific time is mentioned (like "5pm-7pm"), use EXACTLY those specified times.
4. For example, if user says "meeting at 5pm", the start time should be today at 5:00 PM local time.
5. Times are ALWAYS based on what the user explicitly states, not adjusted for any timezone.
6. For dates/times that might be ambiguous, use the current date as default.

SCHEDULING RULES:
1. CREATE SHORT, CONCISE TITLES that capture the essence of the activity (e.g., "Gym" instead of "go to the gym")
2. If a time range is specified (like "5pm-7pm"), use those PRECISE times
3. CAREFULLY IDENTIFY RECURRENCE PATTERNS in natural language - daily, weekly, monthly, specific days, etc.
4. ALWAYS include a recurrence object for recurring events
5. If the user mentions TODAY, TOMORROW, or specific dates, use those exact dates
6. DO NOT suggest or create events at times that conflict with existing events in the user's schedule
7. IMPORTANT: When generating multiple events (like a study schedule), MAKE SURE they don't overlap with each other or with existing events

Today is ${currentDate}, ${currentDay} and the current time is ${currentTime}.${previousEventsContext}
`;

    // User input is the calendar details provided
    const userPrompt = userInput;

    console.log("Sending request to OpenRouter.ai API with system prompt length:", systemPrompt.length);
    console.log("User prompt:", userPrompt);

    // OpenRouter API key for MistralAI
    const OPENROUTER_API_KEY = "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";

    // Make request to the OpenRouter API with MistralAI model
    console.log("Starting OpenRouter API request...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://lovable.ai",
        "X-Title": "Calendar AI Assistant"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-nemo:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("OpenRouter API error response:", errorResponse);
      throw new Error(`OpenRouter API error: ${errorResponse}`);
    }

    const data = await response.json();
    
    console.log("OpenRouter API response status:", response.status);
    console.log("OpenRouter API response:", JSON.stringify(data, null, 2));
    
    // Extract the AI response content
    const aiResponse = data.choices[0].message.content;
    console.log("AI raw response:", aiResponse);
    
    // Try to parse the JSON response from the AI
    let parsedEvents;
    try {
      // Handle potential text before or after the JSON
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      console.log("Extracted JSON string:", jsonStr);
      
      parsedEvents = JSON.parse(jsonStr);
      console.log("Successfully parsed events:", parsedEvents);
      
      // Process the events to ensure proper formatting
      const processedEvents = processAIGeneratedEvents(parsedEvents);
      return { events: processedEvents, sourceType: "ai" };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.error("AI response that couldn't be parsed:", aiResponse);
      // Fallback to simple event creation if AI parsing fails
      return { 
        events: [createDefaultEvent(userInput)], 
        sourceType: "fallback",
        error: `Failed to parse AI response: ${error.message}` 
      };
    }
  } catch (error) {
    console.error("Error in AI event generation:", error);
    console.error("Error stack:", error.stack);
    // Fallback to simple event creation
    return { 
      events: [createDefaultEvent(userInput)], 
      sourceType: "fallback",
      error: `AI processing error: ${error.message}` 
    };
  }
}

// Process and standardize AI-generated events
function processAIGeneratedEvents(events) {
  const currentDate = new Date();
  console.log("Processing AI-generated events:", events);
  
  return events.map(event => {
    try {
      console.log("Processing event:", event);
      
      // Ensure start and end are proper dates - without timezone considerations
      let start, end;
      
      // Parse dates ensuring they have proper format, without time zones
      if (event.start) {
        // First try to parse directly
        start = new Date(event.start);
        
        // If the date is invalid or has timezone info, remove any timezone indicators
        if (isNaN(start.getTime()) || event.start.includes('Z') || event.start.includes('+')) {
          // Try to clean up the date string
          const cleanDateStr = event.start.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
          start = new Date(cleanDateStr);
        }
        
        if (isNaN(start.getTime())) {
          console.error("Invalid start date:", event.start);
          start = new Date(currentDate);
          start.setHours(9, 0, 0, 0);
        }
      } else {
        start = new Date(currentDate);
        start.setHours(9, 0, 0, 0);
        console.log("No start date provided, using default:", start);
      }
      
      if (event.end) {
        // First try to parse directly
        end = new Date(event.end);
        
        // If the date is invalid or has timezone info, remove any timezone indicators
        if (isNaN(end.getTime()) || event.end.includes('Z') || event.end.includes('+')) {
          // Try to clean up the date string
          const cleanDateStr = event.end.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
          end = new Date(cleanDateStr);
        }
        
        if (isNaN(end.getTime())) {
          console.error("Invalid end date:", event.end);
          end = new Date(start);
          end.setHours(start.getHours() + 1);
        }
      } else {
        // Default to 1 hour duration
        end = new Date(start);
        end.setHours(start.getHours() + 1);
        console.log("No end date provided, using default:", end);
      }
      
      // Convert days of week to proper format if needed
      let recurrence = null;
      if (event.recurrence) {
        console.log("Processing recurrence:", event.recurrence);
        recurrence = {
          frequency: event.recurrence.frequency || "weekly",
          interval: event.recurrence.interval || 1,
          daysOfWeek: event.recurrence.daysOfWeek || undefined
        };
      }
      
      const processedEvent = {
        title: event.title || "Untitled Event",
        description: event.description || "",
        // Keep dates as ISO strings but WITHOUT timezone specifiers
        start: start.toISOString().split('.')[0],
        end: end.toISOString().split('.')[0],
        allDay: event.allDay || false,
        color: getRandomEventColor(),
        isAIGenerated: true,
        recurrence
      };
      
      console.log("Processed event:", processedEvent);
      return processedEvent;
    } catch (error) {
      console.error("Error processing AI event:", error);
      console.error("Problematic event:", event);
      console.error("Error stack:", error.stack);
      return createDefaultEvent("Event");
    }
  });
}

// Create a default event as a fallback
function createDefaultEvent(text) {
  // Create a simple title from the text (first 30 chars or until first period)
  const title = text.split('.')[0].substring(0, 30) || "Event";
  console.log("Creating default event with title:", title);
  
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
