
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Flag, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalendarFeaturesProps {
  form: UseFormReturn<any>;
  timeOptions: { label: string; value: string }[];
}

const CalendarFeatures = ({ form, timeOptions }: CalendarFeaturesProps) => {
  return (
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
  );
};

export default CalendarFeatures;
