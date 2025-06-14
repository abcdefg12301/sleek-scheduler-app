import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { processAIGeneratedEvents, createDefaultEvent } from "./processEvents.ts";
import { buildSystemPrompt } from "./buildSystemPrompt.ts";

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
    
    // Build system prompt from helper
    const systemPrompt = buildSystemPrompt(userInput, previousEvents);

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
      
      // Process the events to ensure proper formatting (now pass existing events for conflict avoidance)
      const processedEvents = processAIGeneratedEvents(parsedEvents, previousEvents);
      return { events: processedEvents, sourceType: "ai" };
    } catch (error) {
      // Fallback to simple event creation if AI parsing fails
      return { 
        events: [createDefaultEvent(userInput)], 
        sourceType: "fallback",
        error: `Failed to parse AI response: ${error.message}` 
      };
    }
  } catch (error) {
    // Fallback to simple event creation
    return { 
      events: [createDefaultEvent(userInput)], 
      sourceType: "fallback",
      error: `AI processing error: ${error.message}` 
    };
  }
}
