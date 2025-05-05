
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
import { Switch } from '@/components/ui/switch';
import { Flag } from 'lucide-react';

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
          rules={{ 
            required: 'Calendar name is required',
            maxLength: {
              value: 50,
              message: 'Calendar name cannot exceed 50 characters'
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calendar Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="My Calendar" 
                  {...field} 
                  maxLength={50}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          rules={{
            maxLength: {
              value: 200,
              message: 'Description cannot exceed 200 characters'
            }
          }}
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Optional description for your calendar" 
                  className="resize-none" 
                  {...field} 
                  maxLength={200}
                />
              </FormControl>
              <FormDescription>
                Add details about what this calendar is for. Maximum 200 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showHolidays"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 border mt-4">
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
