
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface CalendarFeaturesProps {
  form: UseFormReturn<any>;
  timeOptions: { label: string; value: string }[];
}

const CalendarFeatures = ({ form, timeOptions }: CalendarFeaturesProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        {/* Features are now moved to CalendarBasicDetails */}
        <CardTitle className="text-lg mb-4">Additional Features</CardTitle>
        <p className="text-muted-foreground">
          More calendar features will be available in future updates.
        </p>
      </CardContent>
    </Card>
  );
};

export default CalendarFeatures;
