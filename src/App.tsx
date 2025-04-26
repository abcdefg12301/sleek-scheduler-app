
import { Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Dashboard from '@/pages/Dashboard';
import NewCalendar from '@/pages/NewCalendar';
import EditCalendar from '@/pages/EditCalendar';
import CalendarView from '@/pages/calendar-view/CalendarView';
import NotFound from '@/pages/NotFound';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="calendar-theme">
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-calendar" element={<NewCalendar />} />
          <Route path="/edit-calendar/:id" element={<EditCalendar />} />
          <Route path="/calendar/:id" element={<CalendarView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
