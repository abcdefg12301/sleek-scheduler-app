
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import DateTimeFields from './event-form/DateTimeFields';
import EventDetailsFields from './event-form/EventDetailsFields';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventFormFieldsProps {
  form: UseFormReturn<any>;
  isAllDay: boolean;
  startDate: Date;
  endDate: Date;
  timeOptions: { label: string; value: string }[];
  handleStartDateChange: (date: Date | undefined) => void;
  setEndDate: (date: Date) => void;
}

const EventFormFields: React.FC<EventFormFieldsProps> = ({
  form,
  isAllDay,
  startDate,
  endDate,
  timeOptions,
  handleStartDateChange,
  setEndDate,
}) => {
  // Initialize with current time when the component mounts
  useEffect(() => {
    // If the form is being used for creating a new event,
    // initialize with current time
    const isNewEvent = !form.getValues('id');
    
    if (isNewEvent) {
      const now = new Date();
      handleStartDateChange(now);
      
      // Set end time one hour later
      const oneHourLater = new Date(now);
      oneHourLater.setHours(now.getHours() + 1);
      setEndDate(oneHourLater);
    }
  }, []);

  return (
    <ScrollArea className="h-[calc(100vh-400px)]">
      <div className="p-1">
        <EventDetailsFields form={form} />
        
        <div className="mb-4">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleStartDateChange}
            className="mx-auto"
          />
        </div>
        
        <DateTimeFields 
          form={form}
          isAllDay={isAllDay}
          startDate={startDate}
          endDate={endDate}
          timeOptions={timeOptions}
          handleStartDateChange={handleStartDateChange}
          setEndDate={setEndDate}
        />
      </div>
    </ScrollArea>
  );
};

export default EventFormFields;
