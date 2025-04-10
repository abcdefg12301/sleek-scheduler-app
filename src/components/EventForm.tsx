
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTimeOptions, parseTimeOption } from '@/lib/date-utils';
import { Event, RecurrenceRule } from '@/types';
import ColorPicker from './ColorPicker';
import RecurrenceOptions from './RecurrenceOptions';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventFormProps {
  initialValues?: Partial<Event>;
  onSubmit: (data: Omit<Event, 'id' | 'calendarId'>) => void;
  onCancel: () => void;
}

const EventForm = ({ initialValues, onSubmit, onCancel }: EventFormProps) => {
  const [startDate, setStartDate] = useState<Date>(initialValues?.start || new Date());
  const [endDate, setEndDate] = useState<Date>(initialValues?.end || new Date());
  const [isAllDay, setIsAllDay] = useState<boolean>(initialValues?.allDay || false);
  const [timeOptions] = useState(getTimeOptions());
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(initialValues?.recurrence);
  
  const defaultValues = {
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    location: initialValues?.location || '',
    allDay: initialValues?.allDay || false,
    color: initialValues?.color || '#8B5CF6',
    start: initialValues?.start || new Date(),
    end: initialValues?.end || new Date(),
    startTime: initialValues?.start ? 
      format(initialValues.start, 'HH:mm') : 
      format(new Date(), 'HH:mm'),
    endTime: initialValues?.end ? 
      format(initialValues.end, 'HH:mm') : 
      format(new Date(new Date().getTime() + 60 * 60 * 1000), 'HH:mm'),
  };
  
  const form = useForm({ defaultValues });
  
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      
      // Adjust end date if it's now before start date
      if (endDate < date) {
        setEndDate(date);
        form.setValue('end', date);
      }
    }
  };
  
  const handleAllDayToggle = (checked: boolean) => {
    setIsAllDay(checked);
  };
  
  const handleFormSubmit = (data: any) => {
    // Create start and end dates with combined date and time
    const processedData = { ...data };
    
    if (data.allDay) {
      // For all-day events, set times to start/end of day
      const startDay = new Date(startDate);
      startDay.setHours(0, 0, 0, 0);
      
      const endDay = new Date(endDate);
      endDay.setHours(23, 59, 59, 999);
      
      processedData.start = startDay;
      processedData.end = endDay;
    } else {
      // Combine date and time for non-all-day events
      processedData.start = parseTimeOption(data.startTime, startDate);
      processedData.end = parseTimeOption(data.endTime, endDate);
    }
    
    // Remove the separate time fields before submitting
    delete processedData.startTime;
    delete processedData.endTime;
    
    // Add recurrence information
    if (recurrence) {
      processedData.recurrence = recurrence;
    }
    
    onSubmit(processedData);
  };
  
  return (
    <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event title</FormLabel>
                <FormControl>
                  <Input placeholder="Add title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="allDay"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">All day</FormLabel>
                  <FormDescription>
                    Event will last the entire day
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleAllDayToggle(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          field.onChange(date);
                          handleStartDateChange(date);
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isAllDay && (
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          if (date && date < startDate) {
                            return;
                          }
                          field.onChange(date);
                          setEndDate(date || new Date());
                        }}
                        disabled={(date) => date < startDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isAllDay && (
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Add location" {...field} />
                </FormControl>
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
                    placeholder="Add description" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="border p-4 rounded-md">
            <FormLabel className="mb-2 block">Recurrence</FormLabel>
            <RecurrenceOptions 
              value={recurrence} 
              onChange={setRecurrence} 
              startDate={startDate} 
            />
          </div>
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
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
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialValues?.id ? "Update" : "Create"} Event
            </Button>
          </div>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default EventForm;
