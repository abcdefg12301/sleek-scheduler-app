
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ColorPicker from '@/components/ColorPicker';
import { Card, CardContent } from '@/components/ui/card';

interface CalendarBasicDetailsProps {
  form: UseFormReturn<any>;
}

const CalendarBasicDetails = ({ form }: CalendarBasicDetailsProps) => {
  return (
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
  );
};

export default CalendarBasicDetails;
