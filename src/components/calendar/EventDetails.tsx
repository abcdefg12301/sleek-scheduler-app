
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  PencilIcon, 
  TrashIcon, 
  RepeatIcon
} from 'lucide-react';
import { Event } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface EventDetailsProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onEdit, onDelete }) => {
  const formatTimeRange = () => {
    if (event.allDay) {
      return 'All day';
    }
    
    const startTime = format(new Date(event.start), 'h:mm a');
    const endTime = format(new Date(event.end), 'h:mm a');
    return `${startTime} - ${endTime}`;
  };

  const formatDate = () => {
    if (event.allDay) {
      return format(new Date(event.start), 'EEEE, MMMM d, yyyy');
    }
    return format(new Date(event.start), 'EEEE, MMMM d, yyyy');
  };

  const isRecurring = event.recurrence || event.isRecurrenceInstance;

  return (
    <div className="space-y-6">
      {/* Event title and color indicator */}
      <div className="flex items-center gap-2">
        {event.color && (
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: event.color }}
          />
        )}
        <h3 className="text-lg font-medium">{event.title}</h3>
      </div>

      {/* Date and time */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <CalendarIcon className="w-5 h-5 mt-0.5 text-gray-500" />
          <div>
            <p>{formatDate()}</p>
            {isRecurring && (
              <div className="flex items-center gap-1 mt-1">
                <RepeatIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {event.recurrence ? `Repeats ${event.recurrence.frequency}` : 'Recurring event'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ClockIcon className="w-5 h-5 text-gray-500" />
          <p>{formatTimeRange()}</p>
        </div>

        {event.location && (
          <div className="flex items-center gap-3">
            <MapPinIcon className="w-5 h-5 text-gray-500" />
            <p>{event.location}</p>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">{event.description}</p>
        </div>
      )}
      
      {/* Tags/indicators */}
      <div className="flex flex-wrap gap-2">
        {event.isHoliday && <Badge variant="outline">Holiday</Badge>}
        {event.isAIGenerated && <Badge variant="outline">AI Generated</Badge>}
        {isRecurring && <Badge variant="outline">Recurring</Badge>}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onDelete}
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button 
          size="sm" 
          onClick={onEdit}
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>
    </div>
  );
};

export default EventDetails;
