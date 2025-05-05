
import React from 'react';
import { Calendar } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar-store';

interface CalendarCardProps {
  calendar: Calendar;
  onDelete: (id: string) => void;
}

const CalendarCard = ({ calendar, onDelete }: CalendarCardProps) => {
  const navigate = useNavigate();
  const { selectCalendar } = useCalendarStore();
  
  const handleView = () => {
    selectCalendar(calendar.id);
    navigate(`/calendar/${calendar.id}`);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-calendar/${calendar.id}`);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(calendar.id);
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleView}>
      <CardHeader>
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-2" 
            style={{ backgroundColor: calendar.color }}
          />
          <CardTitle className="text-lg truncate" title={calendar.name}>
            {calendar.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-3" title={calendar.description}>
          {calendar.description || "No description provided"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Pencil size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
          <Trash2 size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CalendarCard;
