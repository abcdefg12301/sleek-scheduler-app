
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, CalendarCheck, Settings } from 'lucide-react';
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
  calendarColor?: string;
  showHolidays: boolean;
  handleHolidaysToggle: (enabled: boolean) => void;
  handleNewEvent: () => void;
}

const CalendarSettings = ({
  calendarId,
  calendarColor,
  showHolidays,
  handleHolidaysToggle,
  handleNewEvent
}: CalendarSettingsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleNewEvent} 
        size="sm" 
        variant="default"
        style={{
          backgroundColor: calendarColor || undefined,
          color: calendarColor ? '#ffffff' : undefined
        }}
      >
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
            <DropdownMenuItem onClick={() => navigate(`/edit-calendar/${calendarId}`)}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              <span>Edit calendar</span>
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
