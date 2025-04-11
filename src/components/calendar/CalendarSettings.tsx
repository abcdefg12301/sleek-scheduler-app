
import React from 'react';
import { Settings, CalendarIcon, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';

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
    <div className="flex items-center space-x-2">
      <ThemeToggle />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Calendar Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate(`/edit-calendar/${calendarId}`)}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Edit Calendar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openSleepScheduleDialog}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Sleep Schedule</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Flag className="mr-2 h-4 w-4" />
                  <span>Show Holidays</span>
                </div>
                <Switch 
                  checked={showHolidays} 
                  onCheckedChange={handleHolidaysToggle}
                />
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button onClick={handleNewEvent}>
        <Plus className="mr-2 h-4 w-4" /> Event
      </Button>
    </div>
  );
};

export default CalendarSettings;
