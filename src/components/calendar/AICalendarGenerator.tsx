
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InfoCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalendarStore } from '@/store/calendar-store';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AICalendarGeneratorProps {
  calendarId: string;
}

const AICalendarGenerator = ({ calendarId }: AICalendarGeneratorProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [calendarDetails, setCalendarDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addEvent } = useCalendarStore();

  const handleGenerate = async () => {
    if (!calendarDetails.trim()) {
      toast.error('Please enter calendar details');
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-calendar', {
        body: { calendarDetails },
      });

      if (error) {
        console.error('Error generating calendar:', error);
        toast.error('Failed to generate calendar events');
        return;
      }

      if (!data.events || !Array.isArray(data.events)) {
        toast.error('Invalid response from AI');
        return;
      }

      // Add all generated events to the calendar
      let addedCount = 0;
      for (const event of data.events) {
        try {
          // Convert ISO string dates to Date objects
          const eventWithDates = {
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            // Convert recurrence end date if it exists
            recurrence: event.recurrence ? {
              ...event.recurrence,
              endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined
            } : undefined
          };

          addEvent(calendarId, eventWithDates);
          addedCount++;
        } catch (eventError) {
          console.error('Error adding event:', eventError, event);
        }
      }

      if (addedCount > 0) {
        toast.success(`Successfully added ${addedCount} events to your calendar`);
        setCalendarDetails('');
      } else {
        toast.error('Failed to add any events to your calendar');
      }

    } catch (error) {
      console.error('Error in AI calendar generation:', error);
      toast.error('An error occurred during calendar generation');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isEnabled) {
    return (
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            AI Calendar Generator
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Let AI generate events for your calendar based on your description</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="ai-generator-toggle"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <Label htmlFor="ai-generator-toggle">Enable</Label>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          Calendar Details
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This tool uses AI to generate calendar events based on your description</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            id="ai-generator-toggle"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label htmlFor="ai-generator-toggle">Enable</Label>
        </div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default AICalendarGenerator;
