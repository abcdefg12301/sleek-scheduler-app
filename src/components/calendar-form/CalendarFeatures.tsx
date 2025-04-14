
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
import { Flag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
      </CardContent>
    </Card>
  );
};

export default CalendarFeatures;
