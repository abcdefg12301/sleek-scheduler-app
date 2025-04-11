
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import DateTimeFields from './event-form/DateTimeFields';
import EventDetailsFields from './event-form/EventDetailsFields';

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
  return (
    <>
      <EventDetailsFields form={form} />
      <DateTimeFields 
        form={form}
        isAllDay={isAllDay}
        startDate={startDate}
        endDate={endDate}
        timeOptions={timeOptions}
        handleStartDateChange={handleStartDateChange}
        setEndDate={setEndDate}
      />
    </>
  );
};

export default EventFormFields;
