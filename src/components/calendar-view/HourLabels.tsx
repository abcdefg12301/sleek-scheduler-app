
import React from 'react';
import { format } from 'date-fns';

interface HourLabelsProps {
  hours: number[];
}

const HourLabels = ({ hours }: HourLabelsProps) => {
  return (
    <div className="border-r">
      {hours.map((hour) => (
        <div key={hour} className="h-16 flex items-start justify-end pr-2 text-xs text-muted-foreground">
          {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
        </div>
      ))}
    </div>
  );
};

export default HourLabels;
