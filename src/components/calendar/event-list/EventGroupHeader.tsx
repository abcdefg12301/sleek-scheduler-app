
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EventGroupHeaderProps {
  groupKey: string;
  eventCount: number;
}

const EventGroupHeader: React.FC<EventGroupHeaderProps> = ({ groupKey, eventCount }) => {
  return (
    <h3 className="text-sm font-medium capitalize flex items-center mb-1">
      {groupKey === 'one-time' ? 'One-time events' : `${groupKey} events`}
      <Badge variant="outline" className="ml-2">
        {eventCount}
      </Badge>
    </h3>
  );
};

export default EventGroupHeader;
