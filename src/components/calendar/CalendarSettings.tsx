
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Moon, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarSettingsProps {
  calendarId: string;
  showHolidays: boolean;
  handleHolidaysToggle: (enabled: boolean) => void;
  handleNewEvent: () => void;
  openSleepScheduleDialog: () => void;
}

const CalendarSettings = ({
  calendarId,
  showHolidays,
  handleHolidaysToggle,
  handleNewEvent,
  openSleepScheduleDialog,
}: CalendarSettingsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleNewEvent} size="sm" className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />
              Event
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add a new calendar event</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Calendar Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            handleHolidaysToggle(!showHolidays);
          }}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Show Holidays</span>
              </div>
              <Switch 
                checked={showHolidays} 
                onCheckedChange={handleHolidaysToggle}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            openSleepScheduleDialog();
          }}>
            <Moon className="h-4 w-4 mr-2" />
            <span>Sleep Schedule</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CalendarSettings;
