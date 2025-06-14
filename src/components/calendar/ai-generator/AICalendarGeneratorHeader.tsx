
import React from 'react';
import { Bot, Info } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const AICalendarGeneratorHeader: React.FC = () => {
  return (
    <CardTitle className="text-md flex items-center gap-2">
      <Bot className="h-5 w-5" />
      Calendar Generator
      <Tooltip>
        <TooltipTrigger asChild>
          {/* The button must NOT trigger submits or onClick. */}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            tabIndex={0}
            type="button"
            aria-label="Info"
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p>
            Please describe your events in natural language.<br />
            <b>It is <u>required</u> that you specify how often your event occurs (the frequency): e.g., "Daily", "Weekly", "every Tuesday", etc. If not specified, events may not be generated correctly.</b>
            <br /><br />
            Examples:<br />
            • "I go to the gym <b>Monday, Wednesday, and Friday</b> from 5pm-7pm"<br />
            • "I have a team meeting <b>every Tuesday at 10am</b>"<br />
            • "Generate a study schedule <b>after 3pm before I sleep</b>"<br />
            • "Team lunch at <b>12:30pm on Fridays</b>"
          </p>
        </TooltipContent>
      </Tooltip>
    </CardTitle>
  );
};
export default AICalendarGeneratorHeader;
