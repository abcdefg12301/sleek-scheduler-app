
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
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold">{formatMonthYear(currentDate)}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onToday}>
          Today
        </Button>
        <div className="flex items-center">
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
