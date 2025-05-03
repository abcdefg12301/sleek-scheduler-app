
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
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
            <Info className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p>
            Describe your events in natural language. Examples:<br />
            • "I go to the gym Monday, Wednesday, and Friday from 5pm-7pm"<br />
            • "I have a team meeting every Tuesday at 10am"<br />
            • "Generate a study schedule after 3pm before I sleep"<br />
            • "Team lunch at 12:30pm on Fridays"
          </p>
        </TooltipContent>
      </Tooltip>
    </CardTitle>
  );
};

export default AICalendarGeneratorHeader;
