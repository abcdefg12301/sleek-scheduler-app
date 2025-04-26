
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
import { Calendar } from '@/types';

interface CalendarSettingsProps {
  calendarId?: string;
  calendar?: Calendar;
  calendarColor?: string;
  showHolidays?: boolean;
  handleHolidaysToggle: (enabled: boolean) => void;
  showNewEventButton?: boolean;
  onNewEvent?: () => void;
}

const CalendarSettings = ({
  calendarId,
  calendar,
  calendarColor,
  showHolidays = true,
  handleHolidaysToggle,
  showNewEventButton = false,
  onNewEvent
}: CalendarSettingsProps) => {
  const navigate = useNavigate();
  
  const id = calendarId || (calendar ? calendar.id : '');
  const color = calendarColor || (calendar ? calendar.color : undefined);
  const showHolidaysValue = typeof showHolidays !== 'undefined' ? showHolidays : (calendar ? calendar.showHolidays : true);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate(`/edit-calendar/${id}`)}>
            <CalendarCheck className="mr-2 h-4 w-4" />
            <span>Edit calendar</span>
          </DropdownMenuItem>
          
          {showNewEventButton && onNewEvent && (
            <DropdownMenuItem onClick={onNewEvent}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              <span>New event</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-holidays" className="font-normal">Show holidays</Label>
            <Switch 
              id="show-holidays" 
              checked={showHolidaysValue}
              onCheckedChange={handleHolidaysToggle}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CalendarSettings;
