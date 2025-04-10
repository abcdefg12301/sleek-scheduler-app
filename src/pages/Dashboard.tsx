
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar-store';
import CalendarCard from '@/components/CalendarCard';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { calendars, deleteCalendar } = useCalendarStore();
  
  const handleCreateCalendar = () => {
    navigate('/new-calendar');
  };
  
  const handleDeleteCalendar = (id: string) => {
    deleteCalendar(id);
    toast.success('Calendar deleted');
  };
  
  return (
    <div className="container py-8 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Calendars</h1>
        <Button onClick={handleCreateCalendar}>
          <Plus className="mr-2 h-4 w-4" /> New Calendar
        </Button>
      </div>
      
      {calendars.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-medium text-muted-foreground mb-4">
            You don't have any calendars yet
          </h2>
          <p className="text-muted-foreground mb-8">
            Create a new calendar to get started
          </p>
          <Button onClick={handleCreateCalendar}>
            <Plus className="mr-2 h-4 w-4" /> Create Calendar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calendars.map((calendar) => (
            <CalendarCard 
              key={calendar.id}
              calendar={calendar}
              onDelete={handleDeleteCalendar}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
