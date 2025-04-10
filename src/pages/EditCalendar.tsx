
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { SleepSchedule } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormData {
  name: string;
  description: string;
  color: string;
  showHolidays: boolean;
  sleepSchedule: SleepSchedule;
}

const EditCalendar = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { calendars, updateCalendar, updateSleepSchedule } = useCalendarStore();
  
  const calendar = calendars.find(cal => cal.id === id);
  
  const form = useForm<FormData>({
    defaultValues: {
      name: calendar?.name || '',
      description: calendar?.description || '',
      color: calendar?.color || '#8B5CF6',
      showHolidays: calendar?.showHolidays !== undefined ? calendar.showHolidays : true,
      sleepSchedule: calendar?.sleepSchedule || { enabled: false, startTime: '22:00', endTime: '06:00' }
    },
  });
  
  useEffect(() => {
    if (!calendar && id) {
      toast.error('Calendar not found');
      navigate('/');
    }
  }, [calendar, id, navigate]);
  
  const onSubmit = (data: FormData) => {
    if (id) {
      updateCalendar(id, {
        name: data.name,
        description: data.description,
        color: data.color,
        showHolidays: data.showHolidays
      });
      
      updateSleepSchedule(id, data.sleepSchedule);
      
      toast.success('Calendar updated successfully');
      navigate(`/calendar/${id}`);
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
  
  if (!calendar) {
    return null;
  }

  return (
    <div className="container max-w-xl pt-10 pb-20">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/calendar/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Calendar
        </Button>
        <h1 className="text-2xl font-bold mb-2">Edit Calendar</h1>
        <p className="text-muted-foreground">
          Update your calendar settings.
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
                      <Input {...field} />
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
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
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditCalendar;
