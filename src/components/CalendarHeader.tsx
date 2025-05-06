
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear } from '@/lib/date-utils';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  viewMode?: 'day' | 'week' | 'month';
}

const CalendarHeader = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  viewMode = 'month',
}: CalendarHeaderProps) => {
  return (
    <div className="grid grid-cols-3 items-center mb-6 max-w-screen-lg mx-auto">
      <div className="flex justify-start">
        <h2 className="text-2xl font-bold">{formatMonthYear(currentDate)}</h2>
      </div>
      
      <div className="flex justify-center">
        {/* Center section - empty for alignment */}
      </div>
      
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={onToday} size="sm">
          Today
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onPrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
