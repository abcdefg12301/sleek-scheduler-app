
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const NewCalendar = () => {
  const navigate = useNavigate();
  const { addCalendar } = useCalendarStore();
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');
  
  const form = useForm<CalendarFormData>({
    defaultValues: {
      name: '',
      description: '',
      color: '#8B5CF6',
    },
  });
  
  const onSubmit = (data: CalendarFormData) => {
    const newCalendar = addCalendar(data.name, data.description, data.color);
    toast.success('Calendar created successfully');
    navigate(`/calendar/${newCalendar.id}`);
  };
  
  return (
    <div className="container py-8 max-w-2xl animate-fade-in">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Calendars
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details to create a new calendar
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
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button type="submit">Create Calendar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewCalendar;
