
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCalendarStore } from '@/store/calendar-store';
import ColorPicker from '@/components/ColorPicker';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarFormData {
  name: string;
  description: string;
  color: string;
}

const EditCalendar = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { calendars, updateCalendar } = useCalendarStore();
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');
  
  const calendar = calendars.find(cal => cal.id === id);
  
  const form = useForm<CalendarFormData>({
    defaultValues: {
      name: calendar?.name || '',
      description: calendar?.description || '',
      color: calendar?.color || '#8B5CF6',
    },
  });
  
  useEffect(() => {
    if (calendar) {
      form.reset({
        name: calendar.name,
        description: calendar.description,
        color: calendar.color,
      });
      setSelectedColor(calendar.color);
    } else {
      navigate('/');
    }
  }, [calendar, form, navigate]);
  
  const onSubmit = (data: CalendarFormData) => {
    if (id) {
      updateCalendar(id, data);
      toast.success('Calendar updated successfully');
      navigate(`/calendar/${id}`);
    }
  };
  
  if (!calendar) {
    return null;
  }
  
  return (
    <div className="container py-8 max-w-2xl animate-fade-in">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(`/calendar/${id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Calendar
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Update the details of your calendar
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: 'Calendar name is required',
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calendar Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter calendar name" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Give your calendar a descriptive name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter a description for your calendar" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Describe the purpose of this calendar
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calendar Color</FormLabel>
                <FormControl>
                  <div>
                    <ColorPicker
                      selectedColor={selectedColor}
                      onColorChange={(color) => {
                        setSelectedColor(color);
                        field.onChange(color);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Choose a color to identify this calendar
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/calendar/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Calendar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditCalendar;
