
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
    console.log('Generating calendar with details:', calendarDetails);

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

      toast.success(`Successfully generated ${processedEvents.length} events`);
      
      // Auto-open the preview if we generated events
      if (processedEvents.length > 0) {
        setIsPreviewOpen(true);
      }
      
      // Clear the input only if successful
      setCalendarDetails('');
    } catch (error) {
      console.error('Error in AI calendar generation:', error);
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
