
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIGeneratedEventsList from './AIGeneratedEventsList';
import { Event } from '@/types';

interface AICalendarGeneratorProps {
  standalone?: boolean;
  onEventsGenerated?: (events: Event[]) => void;
}

const AICalendarGenerator = ({ standalone = false, onEventsGenerated }: AICalendarGeneratorProps) => {
  const [calendarDetails, setCalendarDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<Event[]>([]);

  const handleDeleteEvent = (index: number) => {
    const newEvents = [...generatedEvents];
    newEvents.splice(index, 1);
    setGeneratedEvents(newEvents);
    
    if (onEventsGenerated) {
      onEventsGenerated(newEvents);
    }
  };

  const handleGenerate = async () => {
    if (!calendarDetails.trim()) {
      toast.error('Please enter calendar details');
      return;
    }

    setIsGenerating(true);
    console.log('Generating calendar with details:', calendarDetails);

    try {
      const { data, error } = await supabase.functions.invoke('generate-calendar', {
        body: { calendarDetails },
      });

      console.log('Response from generate-calendar function:', data, error);

      if (error) {
        console.error('Error generating calendar:', error);
        toast.error(`Failed to generate calendar events: ${error.message || 'Unknown error'}`);
        return;
      }

      if (!data || !data.events || !Array.isArray(data.events)) {
        console.error('Invalid response format from AI:', data);
        toast.error('Invalid response from AI');
        return;
      }

      // Process received events to ensure all dates are properly parsed
      const processedEvents = data.events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      // Add new events to existing ones instead of replacing
      const newEvents = [...generatedEvents, ...processedEvents];
      setGeneratedEvents(newEvents);
      
      if (onEventsGenerated) {
        onEventsGenerated(newEvents);
      }

      toast.success(`Successfully generated ${processedEvents.length} new events`);
      setCalendarDetails('');
    } catch (error) {
      console.error('Error in AI calendar generation:', error);
      toast.error('An error occurred during calendar generation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          Calendar Details
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Describe your events in natural language. For example: "I go to the gym Monday, Wednesday, and Friday from 5pm-7pm" or "I have a team meeting every Tuesday at 10am"
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Describe your calendar events here (e.g., 'I have weekly team meetings every Monday at 10 AM, a doctor's appointment next Tuesday at 3 PM, and I go to the gym Monday, Wednesday, and Friday mornings at 7 AM')"
            className="min-h-[120px]"
            value={calendarDetails}
            onChange={(e) => setCalendarDetails(e.target.value)}
          />
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !calendarDetails.trim()}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Events'}
          </Button>
          
          {generatedEvents.length > 0 && (
            <AIGeneratedEventsList 
              events={generatedEvents} 
              onDeleteEvent={handleDeleteEvent}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AICalendarGenerator;
