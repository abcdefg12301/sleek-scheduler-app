
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Flag, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarStore } from '@/store/calendar-store';
import ColorPicker from '@/components/ColorPicker';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormData {
  name: string;
  description: string;
  color: string;
  showHolidays: boolean;
  sleepSchedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

const NewCalendar = () => {
  const navigate = useNavigate();
  const { addCalendar } = useCalendarStore();

  const defaultValues: FormData = {
    name: '',
    description: '',
    color: '#8B5CF6',
    showHolidays: true,
    sleepSchedule: {
      enabled: false,
      startTime: '22:00',
      endTime: '06:00'
    }
  };
  
  const form = useForm<FormData>({
    defaultValues,
  });

  const onSubmit = (data: FormData) => {
    console.log('Creating new calendar with data:', data);
    try {
      const newCalendar = addCalendar(
        data.name, 
        data.description, 
        data.color,
        data.showHolidays,
        data.sleepSchedule.enabled ? data.sleepSchedule : undefined
      );
      
      toast.success('Calendar created successfully');
      navigate(`/calendar/${newCalendar.id}`);
    } catch (error) {
      console.error('Failed to create calendar:', error);
      toast.error('Failed to create calendar');
    }
  };

  function generateTimeOptions() {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const h = hour.toString().padStart(2, '0');
        const m = min.toString().padStart(2, '0');
        options.push({ value: `${h}:${m}`, label: formatTimeDisplay(`${h}:${m}`) });
      }
    }
    return options;
  }
  
  function formatTimeDisplay(time: string) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const period = h < 12 ? 'AM' : 'PM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${period}`;
  }
  
  const timeOptions = generateTimeOptions();

  return (
    <div className="container max-w-xl pt-10 pb-20">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold mb-2">Create New Calendar</h1>
        <p className="text-muted-foreground">
          Set up a new calendar to organize your events.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Calendar name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calendar Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Calendar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Optional description for your calendar" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Add details about what this calendar is for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Calendar Color</FormLabel>
                    <FormControl>
                      <ColorPicker 
                        selectedColor={field.value} 
                        onColorChange={field.onChange} 
                      />
                    </FormControl>
                    <FormDescription>
                      Choose a color for your calendar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="showHolidays"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 border">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Flag className="w-4 h-4 mr-2" />
                        <FormLabel className="text-base">Show Holidays</FormLabel>
                      </div>
                      <FormDescription>
                        Display common holidays in your calendar
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sleepSchedule.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 border mt-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Moon className="w-4 h-4 mr-2" />
                        <FormLabel className="text-base">Sleep Schedule</FormLabel>
                      </div>
                      <FormDescription>
                        Track your sleep times in calendar
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('sleepSchedule.enabled') && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="sleepSchedule.startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sleepSchedule.endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wake Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">Create Calendar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewCalendar;
