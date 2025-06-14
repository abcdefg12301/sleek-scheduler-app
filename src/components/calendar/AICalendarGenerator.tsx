
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  onPreviewOpen?: () => void;
}

const AICalendarGenerator = ({
  standalone = false,
  onEventsGenerated,
  calendarId,
  existingEvents = [],
  onPreviewOpen,
}: AICalendarGeneratorProps) => {
  // The state below only affects the "current preview" before saving
  const [calendarDetails, setCalendarDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<Event[]>(existingEvents);
  const [editingEvent, setEditingEvent] = useState<{ event: Event; index: number } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    setGeneratedEvents(existingEvents);
  }, [calendarId, existingEvents]);

  // Deleting or updating always syncs up to parent
  const handleDeleteEvent = (index: number) => {
    const newEvents = [...generatedEvents];
    newEvents.splice(index, 1);
    setGeneratedEvents(newEvents);
    onEventsGenerated?.(newEvents);
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
      isAIGenerated: true,
    };
    setGeneratedEvents(newEvents);
    onEventsGenerated?.(newEvents);
    setEditingEvent(null);
    toast.success('Event updated successfully');
  };

  /**
   * Always submit both saved and previewed AI events for current calendar as context!
   */
  const handleGenerate = async () => {
    if (!calendarDetails.trim()) {
      toast.error('Please enter calendar details');
      return;
    }
    setIsGenerating(true);
    setApiError(null);
    setDebugInfo(null);

    // Always use all AI events for this calendar (passed from parent), so backend gets full context
    const contextEvents = existingEvents || [];
    try {
      const { data, error } = await supabase.functions.invoke('generate-calendar', {
        body: {
          calendarDetails,
          previousEvents: contextEvents,
        },
      });

      if (!data || !data.events || !Array.isArray(data.events)) {
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

      // Combine the new AI events and any existing ones not just replaced (if you want additive)
      setGeneratedEvents(processedEvents);

      // Pass up for preview, replacing only on explicit Save (not on preview)
      onEventsGenerated?.(processedEvents);

      toast.success(`Successfully generated ${processedEvents.length} events`);
      setCalendarDetails('');
      if (onPreviewOpen) onPreviewOpen();
    } catch (err) {
      setApiError(`Client Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDebugInfo(`Client error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error('An error occurred during calendar generation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <AICalendarGeneratorHeader />
      </div>
      <div className="space-y-4">
        <Textarea
          placeholder="Describe your calendar events here..."
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
            type="button"
          >
            {isGenerating ? 'Generating...' : 'Generate Events'}
          </Button>
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
        <EventEditingDialog
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
          onUpdateEvent={handleUpdateEvent}
        />
      </div>
    </div>
  );
};

export default AICalendarGenerator;
