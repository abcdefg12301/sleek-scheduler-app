
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './eventFormSchema';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface EventLocationProps {
  form: UseFormReturn<EventFormValues>;
}

const EventLocation = ({ form }: EventLocationProps) => {
  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Location (optional)</FormLabel>
          <FormControl>
            <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring focus-within:border-input">
              <MapPin className="ml-2 h-4 w-4 text-muted-foreground" />
              <Input 
                {...field}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Add location"
              />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default EventLocation;
