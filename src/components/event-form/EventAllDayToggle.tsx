
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

interface EventAllDayToggleProps {
  form: UseFormReturn<any>;
}

const EventAllDayToggle: React.FC<EventAllDayToggleProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="allDay"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <FormLabel className="text-base">All day event</FormLabel>
            <FormDescription>
              Set as an all-day event with no specific time
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
  );
};

export default EventAllDayToggle;
