
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Info, Calendar, Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIGeneratedEventsList from './AIGeneratedEventsList';
import { Event } from '@/types';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import EventForm from '@/components/EventForm';
import { Separator } from '@/components/ui/separator';
import AICalendarGeneratorHeader from './ai-generator/AICalendarGeneratorHeader';
import EventsPreviewDialog from './ai-generator/EventsPreviewDialog';
import EventEditingDialog from './ai-generator/EventEditingDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AICalendarGeneratorProps {
  standalone?: boolean;
  onEventsGenerated?: (events: Event[]) => void;
}

const AICalendarGenerator = ({ standalone = false, onEventsGenerated }: AICalendarGeneratorProps) => {
  const [calendarDetails, setCalendarDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<{ event: Event; index: number } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleDeleteEvent = (index: number) => {
    const newEvents = [...generatedEvents];
    newEvents.splice(index, 1);
    setGeneratedEvents(newEvents);
    
    if (onEventsGenerated) {
      onEventsGenerated(newEvents);
    }
  };

  const handleEditEvent = (event: Event, index: number) => {
    setEditingEvent({ event, index });
  };

  const handleUpdateEvent = (updatedEvent: Omit<Event, 'id' | 'calendarId'>) => {
    if (!editingEvent) return;

    const newEvents = [...generatedEvents];
    newEvents[editingEvent.index] = { 
      ...updatedEvent,
      id: editingEvent.event.id || '',
      calendarId: editingEvent.event.calendarId || '',
      isAIGenerated: true
    };

    setGeneratedEvents(newEvents);
    
    if (onEventsGenerated) {
      onEventsGenerated(newEvents);
    }

    setEditingEvent(null);
    toast.success('Event updated successfully');
  };

  const handleGenerate = async () => {
    if (!calendarDetails.trim()) {
      toast.error('Please enter calendar details');
      return;
    }

    setIsGenerating(true);
    setApiError(null);
    setDebugInfo(null);
    console.log('Generating calendar with details:', calendarDetails);
    console.log('Using previous events for context:', generatedEvents.length > 0 ? `${generatedEvents.length} events` : 'None');

    try {
      // Pass existing generated events to provide context to the AI
      const { data, error } = await supabase.functions.invoke('generate-calendar', {
        body: { 
          calendarDetails,
          previousEvents: generatedEvents 
        },
      });

      console.log('Response from generate-calendar function:', data, error);

      if (error) {
        console.error('Error generating calendar:', error);
        setApiError(`API Error: ${error.message || 'Unknown error'}`);
        setDebugInfo(`Function error: ${error.message || 'Unknown error'}`);
        toast.error(`Failed to generate calendar events: ${error.message || 'Unknown error'}`);
        return;
      }

      if (!data || !data.events || !Array.isArray(data.events)) {
        console.error('Invalid response format from AI:', data);
        setApiError('Invalid response format from AI');
        setDebugInfo(`Invalid response format: ${JSON.stringify(data)}`);
        toast.error('Invalid response from AI');
        return;
      }

      // Process received events to ensure all dates are properly parsed
      const processedEvents = data.events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      console.log('Processed events from AI:', processedEvents);
      
      // Show debug info if events were generated using fallback mechanism
      if (data.sourceType === 'fallback') {
        const errorMessage = data.error || 'Unknown issue with AI generation';
        setDebugInfo(`AI generation failed: ${errorMessage}. Using fallback events.`);
        console.warn('AI generation failed, using fallback events:', errorMessage);
      } else if (data.sourceType === 'ai') {
        setDebugInfo('Events successfully generated using MistralAI');
        console.log('Events successfully generated using MistralAI');
      }

      // Add new events to existing ones instead of replacing
      const newEvents = [...generatedEvents, ...processedEvents];
      setGeneratedEvents(newEvents);
      
      if (onEventsGenerated) {
        onEventsGenerated(newEvents);
      }

      toast.success(`Successfully generated ${processedEvents.length} events`);
      
      // Auto-open the preview if we generated events
      if (processedEvents.length > 0) {
        setIsPreviewOpen(true);
      }
      
      // Clear the input only if successful
      setCalendarDetails('');
    } catch (error) {
      console.error('Error in AI calendar generation:', error);
      setApiError(`Client Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDebugInfo(`Client error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('An error occurred during calendar generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAllEvents = () => {
    setGeneratedEvents([]);
    if (onEventsGenerated) {
      onEventsGenerated([]);
    }
    toast.success('All generated events cleared');
    setIsPreviewOpen(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <AICalendarGeneratorHeader />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Describe your calendar events here (e.g., 'I have weekly team meetings every Monday at 10 AM, a doctor's appointment next Tuesday at 3 PM, and I go to the gym Monday, Wednesday, and Friday mornings at 7 AM')"
            className="min-h-[120px]"
            value={calendarDetails}
            onChange={(e) => setCalendarDetails(e.target.value)}
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !calendarDetails.trim()}
              className="flex-1"
            >
              {isGenerating ? 'Generating...' : 'Generate Events'}
            </Button>
            
            {generatedEvents.length > 0 && (
              <EventsPreviewDialog
                isOpen={isPreviewOpen}
                setIsOpen={setIsPreviewOpen}
                events={generatedEvents}
                onDeleteEvent={handleDeleteEvent}
                onEditEvent={handleEditEvent}
                clearAllEvents={clearAllEvents}
              />
            )}
          </div>
          
          {apiError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {debugInfo && (
            <Alert className="mt-2">
              <AlertTitle>Debug Info</AlertTitle>
              <AlertDescription className="text-xs font-mono">{debugInfo}</AlertDescription>
            </Alert>
          )}

          {generatedEvents.length > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              {generatedEvents.length} events generated. View or edit them using the "Preview Events" button.
            </div>
          )}
          
          <EventEditingDialog
            editingEvent={editingEvent}
            setEditingEvent={setEditingEvent}
            onUpdateEvent={handleUpdateEvent}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AICalendarGenerator;
