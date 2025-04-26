
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENROUTER_API_KEY = "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";

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

    // Define the prompt
    const systemPrompt = `
      You are an AI assistant specialized in creating calendar events based on user descriptions.
      
      Your task is to analyze the text provided by the user and generate calendar events.
      
      The events you create should include these properties:
      - title: A clear, concise title for the event
      - description: Detailed description of what the event involves
      - location: Where the event takes place (if applicable)
      - start: Start date and time in ISO format
      - end: End date and time in ISO format
      - allDay: Boolean indicating if it's an all-day event
      - recurrence: If the event repeats, include:
        - frequency: 'daily', 'weekly', 'monthly', or 'yearly'
        - interval: Number indicating how often it repeats (e.g., every 2 weeks)
        - endDate: When the recurrence ends (optional)
        - count: How many times it repeats (optional)
      
      Important guidelines:
      - DO NOT create overlapping events unless explicitly mentioned in the description
      - Use reasonable start and end times for events
      - For recurring events, determine the appropriate frequency based on the description
      - Return your response as a valid JSON object with an "events" array containing all generated events
      - Make sure all dates are provided in ISO format
      - If the description doesn't provide enough information, make reasonable assumptions
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "microsoft/mai-ds-r1:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: calendarDetails }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter API error:", data);
      return new Response(JSON.stringify({ error: "Failed to generate calendar events" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the content to ensure it's valid JSON
    try {
      const content = data.choices[0].message.content;
      const parsedEvents = JSON.parse(content);
      
      return new Response(JSON.stringify(parsedEvents), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("Error in generate-calendar function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
