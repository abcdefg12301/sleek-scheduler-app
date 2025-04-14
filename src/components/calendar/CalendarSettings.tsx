
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, CalendarPlus, CalendarCheck, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

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
  openSleepScheduleDialog
}: CalendarSettingsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleNewEvent} size="sm" variant="default">
        <CalendarPlus className="h-4 w-4 mr-1" /> New event
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleNewEvent}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              <span>New event</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/edit/${calendarId}`)}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              <span>Edit calendar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openSleepScheduleDialog}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Sleep schedule</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <div className="p-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-holidays" className="font-normal">Show holidays</Label>
              <Switch 
                id="show-holidays" 
                checked={showHolidays}
                onCheckedChange={handleHolidaysToggle}
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CalendarSettings;
