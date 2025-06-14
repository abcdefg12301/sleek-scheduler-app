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
    const { calendarDetails, previousEvents = [], calendarColor } = await req.json();
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

    const { events, sourceType, error } = await generateEventsWithMistralAI(calendarDetails, previousEvents, calendarColor);
    if (error) {
      console.error("Mistral AI generation error:", error);
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

// ---- KEY UPDATE: Use ONLY Mistral AI via OpenRouter, never anything else ----
async function generateEventsWithMistralAI(userInput: string, previousEvents: any[] = [], calendarColor: string) {
  try {
    // SYSTEM PROMPT -- leave unchanged for your creative logic!
    const now = new Date();
    let previousEventsContext = "";
    if (previousEvents && previousEvents.length > 0) {
      previousEventsContext += "\n\nYou MUST be aware of and avoid conflicts with the user's existing schedule:\n";
      const sortedEvents = [...previousEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      sortedEvents.slice(0, 20).forEach((event, index) => {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const formatSimpleDate = (date: Date) => date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const formatSimpleTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        previousEventsContext += `${index + 1}. "${event.title}" on ${formatSimpleDate(startDate)} from ${formatSimpleTime(startDate)} to ${formatSimpleTime(endDate)}`;
        if (event.recurrence) previousEventsContext += ` (repeats ${event.recurrence.frequency})`;
        previousEventsContext += "\n";
      });
      previousEventsContext += "\nYou MUST avoid scheduling events that overlap with these existing events.";
    }

    // --- HIGHLY CREATIVE SYSTEM PROMPT (as before) ---
    const systemPrompt = `
You are a friendly, ultra-creative, detail-oriented AI calendar coach. 
Given the user's natural language instructions, your job is to SPLIT big or vague requests into SMART, non-overlapping, multi-session events.

GOALS:
- If the user asks for a study schedule, revision timetable, exam plan, or anything long-term, BREAK IT INTO MANY connected, achievable sessions across multiple days or weeks.
- For spaced repetition, revision, or learning routines, spread sessions logically and leave breaks for rest or review.
- VARY times and days where possible; do NOT always pick the same time slot.
- Add milestone sessions and goals where useful!
- FOR EACH event, output:
  * title (short and clear)
  * description (detailed guidance or what to do in session)
  * start (ISO string, e.g., "2025-05-03T17:00:00")
  * end (ISO string)
  * allDay: true/false
  * recurrence: null (or recurrence object if it truly recurs)
  * color (leave null)
- NEVER overlap any "previousEvents" below; avoid all conflicts!
${previousEvents && previousEvents.length > 0 ? `
EXISTING EVENTS TO AVOID OVERLAPPING:
${previousEvents.map((e: any, i: number) => `  ${i + 1}. ${e.title} from ${e.start} to ${e.end}`).join('\n')}
` : 'None'}
RULES:
- NO time zone info, only date/times in ISO format.
- Output ONLY pure JSON array of events, nothing else (no markdown, comments).

Be as creative and helpful as possible—even for study plans, propose milestone reviews, restful breaks, and logical learning progress!
`;

    const userPrompt = userInput;

    // ----- API KEY PULL: Only proceed if key exists -----
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.trim() === "") {
      console.error("Missing OPENROUTER_API_KEY - cannot call Mistral API!");
      return {
        events: [],
        sourceType: "error",
        error: "Server misconfigured: Missing OpenRouter API key for Mistral."
      };
    }

    // --- Mistral AI via OpenRouter API, and ONLY this model ---
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
      console.error("MistralAI API error response:", errorResponse);
      throw new Error(`MistralAI (OpenRouter) API error: ${errorResponse}`);
    }

    const data = await response.json();
    console.log("MistralAI API response:", JSON.stringify(data, null, 2));
    const aiResponse = data.choices[0]?.message?.content;
    console.log("MistralAI raw response:", aiResponse);

    let parsedEvents;
    let parseSucceeded = false;
    try {
      // Try to find a JSON array in the response string
      const arrayMatch = aiResponse && aiResponse.match(/\[[\s\S]*\]/);
      if (arrayMatch && arrayMatch[0]) {
        console.log("Found possible JSON array in response:", arrayMatch[0].slice(0, 100) + (arrayMatch[0].length > 100 ? '...' : ''));
        try {
          parsedEvents = JSON.parse(arrayMatch[0]);
          parseSucceeded = Array.isArray(parsedEvents) && parsedEvents.length > 0;
          if (parseSucceeded) console.log("Parsed events from arrayMatch:", parsedEvents.length);
        } catch (err) {
          console.error("Failed to JSON.parse from arrayMatch:", err);
        }
      }
      // If above fails, try full string parse
      if (!parseSucceeded && aiResponse) {
        try {
          parsedEvents = JSON.parse(aiResponse);
          parseSucceeded = Array.isArray(parsedEvents) && parsedEvents.length > 0;
          if (parseSucceeded) console.log("Parsed events from full response:", parsedEvents.length);
        } catch (err) {
          console.error("Failed to JSON.parse from full response:", err);
        }
      }
      // If still no valid array, log and create clear fallback with diagnostic info
      if (!parseSucceeded || !Array.isArray(parsedEvents)) {
        console.error("AI returned unparseable event array. Raw response:", aiResponse);
        // If it's a non-empty string, show the entire output as one event for diagnostics
        if (typeof aiResponse === "string" && aiResponse.trim().length > 0) {
          return { 
            events: [{
              title: "AI response (diagnostic fallback)",
              description: aiResponse.slice(0, 400),
              start: (new Date()).toISOString().split('.')[0],
              end: (new Date(Date.now() + 3600000)).toISOString().split('.')[0],
              allDay: false,
              color: "#DB4437",
              isAIGenerated: true
            }], 
            sourceType: "diagnostic",
            error: "Could not parse events from AI. Raw output returned as event for debugging."
          };
        }
        // Otherwise give user fallback
        return { 
          events: [createDefaultEvent(userInput)], 
          sourceType: "fallback",
          error: "Could not parse any events from AI response. Full raw response logged."
        };
      }
      const processedEvents = processAIGeneratedEvents(parsedEvents, calendarColor);
      return { events: processedEvents, sourceType: "mistral" };
    } catch (error) {
      console.error("Parse error for AI response:", error, "Raw AI response:", aiResponse);
      return { 
        events: [createDefaultEvent(userInput)], 
        sourceType: "fallback",
        error: `Failed to parse Mistral AI response: ${error.message}` 
      };
    }
  } catch (error) {
    console.error("Error in Mistral AI event generation:", error);
    return { 
      events: [createDefaultEvent(userInput)], 
      sourceType: "fallback",
      error: `Mistral AI processing error: ${error.message}` 
    };
  }
}

// Process and standardize AI-generated events
function processAIGeneratedEvents(events, calendarColor) {
  const currentDate = new Date();
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
        start: start.toISOString().split('.')[0],
        end: end.toISOString().split('.')[0],
        allDay: event.allDay || false,
        color: calendarColor || event.color || getRandomEventColor(),
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
