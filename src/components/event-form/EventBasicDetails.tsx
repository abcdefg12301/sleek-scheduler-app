
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './eventFormSchema';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ColorPicker from '@/components/ColorPicker';

interface EventBasicDetailsProps {
  form: UseFormReturn<EventFormValues>;
}

const EventBasicDetails = ({ form }: EventBasicDetailsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Add title" />
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
            <FormLabel>Description (optional)</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Add description" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Event Color (optional)</FormLabel>
            <FormControl>
              <ColorPicker
                selectedColor={field.value || ''}
                onColorChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default EventBasicDetails;
