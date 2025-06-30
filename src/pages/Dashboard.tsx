
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, LogOut, User } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar-store';
import { useAuth } from '@/hooks/useAuth';
import CalendarCard from '@/components/CalendarCard';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { calendars, initializeStore, isInitialized, deleteCalendar } = useCalendarStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!isInitialized) {
        try {
          await initializeStore();
        } catch (error) {
          console.error('Failed to initialize store:', error);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [initializeStore, isInitialized]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteCalendar = async (id: string) => {
    try {
      await deleteCalendar(id);
    } catch (error) {
      console.error('Failed to delete calendar:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your calendars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendar Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your calendars and events
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user?.email}</span>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {calendars.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <CardTitle>No calendars yet</CardTitle>
            <CardDescription>
              Create your first calendar to start organizing your events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/new-calendar')}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Calendar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Your Calendars</h2>
              <Badge variant="secondary">{calendars.length}</Badge>
            </div>
            <Button
              onClick={() => navigate('/new-calendar')}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Calendar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calendars.map((calendar) => (
              <CalendarCard
                key={calendar.id}
                calendar={calendar}
                onDelete={handleDeleteCalendar}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
