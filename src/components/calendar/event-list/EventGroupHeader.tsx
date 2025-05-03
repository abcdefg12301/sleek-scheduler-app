
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EventGroupHeaderProps {
  /** The group key used to categorize events (e.g., "one-time", "daily", "weekly") */
  groupKey: string;
  /** Number of events in this group */
  eventCount: number;
}

/**
 * Header component for event groups in the event list
 * Displays the group name and event count
 */
const EventGroupHeader: React.FC<EventGroupHeaderProps> = ({ groupKey, eventCount }) => {
  // Format the group key for display
  const getFormattedGroupName = () => {
    switch(groupKey) {
      case 'one-time': 
        return 'One-time events';
      case 'daily':
        return 'Daily events';
      case 'weekly':
        return 'Weekly events';
      case 'monthly':
        return 'Monthly events';
      case 'yearly':
        return 'Yearly events';
      default:
        return `${groupKey} events`;
    }
  };

  return (
    <h3 className="text-sm font-medium capitalize flex items-center mb-1">
      {getFormattedGroupName()}
      <Badge variant="outline" className="ml-2">
        {eventCount}
      </Badge>
    </h3>
  );
};

export default EventGroupHeader;
