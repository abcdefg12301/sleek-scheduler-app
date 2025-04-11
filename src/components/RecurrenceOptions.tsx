
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RecurrenceRule } from '@/types';
import { format } from 'date-fns';

interface RecurrenceOptionsProps {
  value: RecurrenceRule | undefined;
  onChange: (value: RecurrenceRule | undefined) => void;
  startDate: Date;
}

const RecurrenceOptions = ({ value, onChange, startDate }: RecurrenceOptionsProps) => {
  const handleFrequencyChange = (frequency: string) => {
    if (frequency === "none") {
      onChange(undefined);
    } else {
      onChange({
        frequency: frequency as RecurrenceRule['frequency'],
        interval: 1
      });
    }
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!value) return;
    onChange({
      ...value,
      interval: parseInt(e.target.value) || 1
    });
  };

  const handleEndChange = (endType: string) => {
    if (!value) return;
    
    if (endType === "never") {
      const { endDate, count, ...rest } = value;
      onChange(rest);
    } else if (endType === "after") {
      const { endDate, ...rest } = value;
      onChange({
        ...rest,
        count: value.count || 5
      });
    } else if (endType === "on") {
      const { count, ...rest } = value;
      // Default to one month later
      const defaultEndDate = new Date(startDate);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
      
      onChange({
        ...rest,
        endDate: value.endDate || defaultEndDate
      });
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!value) return;
    onChange({
      ...value,
      count: parseInt(e.target.value) || 1
    });
  };

  const handleEndDateChange = (date: string) => {
    if (!value) return;
    const [year, month, day] = date.split('-').map(num => parseInt(num));
    onChange({
      ...value,
      endDate: new Date(year, month - 1, day)
    });
  };

  const getEndDateString = () => {
    if (!value?.endDate) return '';
    const date = new Date(value.endDate);
    return format(date, 'yyyy-MM-dd');
  };

  const getEndType = () => {
    if (!value) return "never";
    if (value.count) return "after";
    if (value.endDate) return "on";
    return "never";
  };

  return (
    <div className="space-y-4">
      <div>
        <RadioGroup 
          value={value ? value.frequency : "none"} 
          onValueChange={handleFrequencyChange}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none">Does not repeat</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily">Daily</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly">Weekly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly">Monthly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly">Yearly</Label>
          </div>
        </RadioGroup>
      </div>

      {value && (
        <>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Repeat every</span>
              <Input
                type="number"
                min="1"
                className="w-16 h-8"
                value={value.interval || 1}
                onChange={handleIntervalChange}
              />
              <span className="text-sm">
                {value.frequency === 'daily' && 'days'}
                {value.frequency === 'weekly' && 'weeks'}
                {value.frequency === 'monthly' && 'months'}
                {value.frequency === 'yearly' && 'years'}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Ends</p>
            <RadioGroup 
              value={getEndType()}
              onValueChange={handleEndChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="end-never" />
                <Label htmlFor="end-never">Never</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after" id="end-after" />
                <Label htmlFor="end-after">After</Label>
                {getEndType() === "after" && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="1"
                      className="w-16 h-8"
                      value={value.count || 5}
                      onChange={handleCountChange}
                    />
                    <span className="text-sm">occurrences</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="on" id="end-on" />
                <Label htmlFor="end-on">On</Label>
                {getEndType() === "on" && (
                  <Input
                    type="date"
                    className="w-40 h-8"
                    value={getEndDateString()}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                  />
                )}
              </div>
            </RadioGroup>
          </div>
        </>
      )}
    </div>
  );
};

export default RecurrenceOptions;
