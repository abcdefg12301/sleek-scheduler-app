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
import { securityService } from '@/services/security-service';
import { useSecureInput } from '@/hooks/useSecureInput';

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
  calendarColor,
}: AICalendarGeneratorProps & { calendarColor?: string }) => {
  const [calendarDetails, setCalendarDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<Event[]>(existingEvents);
  const [editingEvent, setEditingEvent] = useState<{ event: Event; index: number } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { sanitizeAndValidate } = useSecureInput();

  useEffect(() => {
    setGeneratedEvents(existingEvents);
  }, [calendarId, existingEvents]);

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
    
    // Validate and sanitize the updated event
    const validation = securityService.validateEventData(updatedEvent);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }
    
    const newEvents = [...generatedEvents];
    newEvents[editingEvent.index] = {
      ...updatedEvent,
      id: editingEvent.event.id || '',
      calendarId: editingEvent.event.calendarId || calendarId || '',
      isAIGenerated: true,
      title: securityService.sanitizeInput(updatedEvent.title),
      description: updatedEvent.description ? securityService.sanitizeInput(updatedEvent.description) : undefined,
    };
    setGeneratedEvents(newEvents);
    onEventsGenerated?.(newEvents);
    setEditingEvent(null);
    toast.success('Event updated successfully');
  };

  const handleGenerate = async () => {
    // Validate and sanitize input
    const { sanitized, isValid, error } = sanitizeAndValidate(calendarDetails, 1000);
    if (!isValid) {
      toast.error(error || 'Invalid input');
      return;
    }
    
    if (!sanitized.trim()) {
      toast.error('Please enter calendar details');
      return;
    }
    
    // Rate limiting check
    if (!securityService.rateLimiter.isAllowed()) {
      toast.error('Too many requests. Please wait a minute before trying again.');
      return;
    }
    
    setIsGenerating(true);
    setApiError(null);
    setDebugInfo(null);

    const contextEvents = existingEvents || [];
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-calendar', {
        body: {
          calendarDetails: sanitized,
          previousEvents: contextEvents,
        },
      });

      if (!data || !data.events || !Array.isArray(data.events)) {
        setApiError('Invalid response format from AI');
        setDebugInfo(`Invalid response format: ${JSON.stringify(data)}`);
        toast.error('Invalid response from AI');
        return;
      }

      // Validate and sanitize AI-generated events
      const processedEvents = data.events
        .map((event: any) => {
          const validation = securityService.validateEventData(event);
          if (!validation.isValid) {
            console.warn('Invalid AI event:', validation.errors);
            return null;
          }
          
          return {
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            calendarId: calendarId || '',
            isAIGenerated: true,
            color: event.color || calendarColor || '#8B5CF6',
            title: securityService.sanitizeInput(event.title),
            description: event.description ? securityService.sanitizeInput(event.description) : undefined,
          };
        })
        .filter(Boolean);

      const newList = [...generatedEvents];
      processedEvents.forEach(ev => {
        if (!newList.some(e2 =>
          e2.title === ev.title &&
          new Date(e2.start).getTime() === new Date(ev.start).getTime() &&
          new Date(e2.end).getTime() === new Date(ev.end).getTime()
        )) {
          newList.push(ev);
        }
      });

      setGeneratedEvents(newList);
      onEventsGenerated?.(processedEvents);

      toast.success(`Successfully generated ${processedEvents.length} event${processedEvents.length !== 1 ? 's' : ''}`);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { sanitized } = sanitizeAndValidate(e.target.value, 1000);
    setCalendarDetails(sanitized);
  };

  return (
    <div>
      <div className="mb-4">
        <AICalendarGeneratorHeader />
      </div>
      <div className="space-y-4">
        <Textarea
          placeholder="Describe your calendar events here... (max 1000 characters)"
          className="min-h-[120px]"
          value={calendarDetails}
          onChange={handleInputChange}
          maxLength={1000}
        />
        <div className="text-xs text-muted-foreground text-right">
          {calendarDetails.length}/1000 characters
        </div>
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
