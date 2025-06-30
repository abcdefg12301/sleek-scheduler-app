
import { Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Dashboard from '@/pages/Dashboard';
import NewCalendar from '@/pages/NewCalendar';
import EditCalendar from '@/pages/EditCalendar';
import CalendarView from '@/pages/calendar-view/CalendarView';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="calendar-theme">
      <TooltipProvider delayDuration={0}>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/new-calendar" element={<AuthGuard><NewCalendar /></AuthGuard>} />
            <Route path="/edit-calendar/:id" element={<AuthGuard><EditCalendar /></AuthGuard>} />
            <Route path="/calendar/:id" element={<AuthGuard><CalendarView /></AuthGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
