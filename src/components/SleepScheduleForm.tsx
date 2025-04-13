
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SleepSchedule } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bed } from 'lucide-react';
import TimePickerInput from './event-form/TimePickerInput';

interface SleepScheduleFormProps {
  initialValues: SleepSchedule;
  onSubmit: (data: SleepSchedule) => void;
  onCancel: () => void;
}

const SleepScheduleForm = ({ initialValues, onSubmit, onCancel }: SleepScheduleFormProps) => {
  const form = useForm<SleepSchedule>({
    defaultValues: {
      enabled: initialValues?.enabled || false,
      startTime: initialValues?.startTime || '22:00',
      endTime: initialValues?.endTime || '06:00'
    }
  });

  useEffect(() => {
    // Initialize form with provided values
    form.reset({
      enabled: initialValues?.enabled || false,
      startTime: initialValues?.startTime || '22:00',
      endTime: initialValues?.endTime || '06:00' 
    });
  }, [initialValues, form]);
  
  const handleSubmit = (data: SleepSchedule) => {
    onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <Bed className="mr-2 h-5 w-5" /> 
                  Sleep Schedule
                </FormLabel>
                <FormDescription>
                  Track your sleep times in the calendar
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
        
        {form.watch('enabled') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Time</FormLabel>
                  <TimePickerInput
                    value={field.value}
                    onChange={field.onChange}
                    onTimeSelected={field.onChange}
                  />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wake Time</FormLabel>
                  <TimePickerInput
                    value={field.value}
                    onChange={field.onChange}
                    onTimeSelected={field.onChange}
                  />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Sleep Schedule
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SleepScheduleForm;
