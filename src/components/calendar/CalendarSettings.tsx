
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Settings } from 'lucide-react';
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
}

const CalendarSettings = ({
  calendarId,
  calendarColor,
  showHolidays,
  handleHolidaysToggle
}: CalendarSettingsProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
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
  );
};

export default CalendarSettings;
