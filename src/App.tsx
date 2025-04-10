
import { Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Dashboard from '@/pages/Dashboard';
import NewCalendar from '@/pages/NewCalendar';
import EditCalendar from '@/pages/EditCalendar';
import CalendarView from '@/pages/CalendarView';
import NotFound from '@/pages/NotFound';
import { ThemeProvider } from '@/components/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="calendar-theme">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-calendar" element={<NewCalendar />} />
        <Route path="/edit-calendar/:id" element={<EditCalendar />} />
        <Route path="/calendar/:id" element={<CalendarView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
