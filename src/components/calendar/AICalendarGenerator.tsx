import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIGeneratedEventsList from './AIGeneratedEventsList';
import { Event } from '@/types';
import EventsPreviewDialog from './ai-generator/EventsPreviewDialog';
import EventEditingDialog from './ai-generator/EventEditingDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import AICalendarGeneratorHeader from './ai-generator/AICalendarGeneratorHeader';

interface AICalendarGeneratorProps {
  standalone?: boolean;
  onEventsGenerated?: (events: Event[]) => void;
  calendarId?: string;
  existingEvents?: Event[];
}

const AICalendarGenerator = ({
  standalone = false,
  onEventsGenerated,
  calendarId,
  existingEvents = []
}: AICalendarGeneratorProps) => {
  const [calendarDetails, setCalendarDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<Event[]>(existingEvents);
  const [editingEvent, setEditingEvent] = useState<{ event: Event; index: number } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Re-setup events ONLY when calendarId or existingEvents change
  useEffect(() => {
    setGeneratedEvents(existingEvents);
  }, [calendarId, existingEvents]);

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
      calendarId: editingEvent.event.calendarId || calendarId || '',
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
    // Only use this calendar's context for the API
    const contextEvents = generatedEvents.filter(
      event => event.calendarId === calendarId
    );
    try {
      const { data, error } = await supabase.functions.invoke('generate-calendar', {
        body: {
          calendarDetails,
          previousEvents: contextEvents,
        },
      });

      if (!data || !data.events || !Array.isArray(data.events)) {
        console.error('Invalid response format from AI:', data);
        setApiError('Invalid response format from AI');
        setDebugInfo(`Invalid response format: ${JSON.stringify(data)}`);
        toast.error('Invalid response from AI');
        return;
      }
      const processedEvents = data.events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        calendarId: calendarId || '',
        isAIGenerated: true,
      }));

      setGeneratedEvents(processedEvents);
      if (onEventsGenerated) {
        onEventsGenerated(processedEvents);
      }
      toast.success(`Successfully generated ${processedEvents.length} events`);
      if (processedEvents.length > 0) {
        setIsPreviewOpen(true);
      }
      setCalendarDetails('');
    } catch (err) {
      console.error('Error in AI calendar generation:', err);
      setApiError(`Client Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDebugInfo(`Client error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
            maxLength={500}
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
