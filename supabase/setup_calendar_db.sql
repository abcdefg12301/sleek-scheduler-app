
-- Create calendars table
CREATE TABLE public.calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  show_holidays BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES public.calendars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  color TEXT,
  is_holiday BOOLEAN DEFAULT false,
  is_segment BOOLEAN DEFAULT false,
  segment_type TEXT,
  is_recurrence_instance BOOLEAN DEFAULT false,
  original_event_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recurrence table for recurring events
CREATE TABLE public.recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval INTEGER NOT NULL DEFAULT 1,
  end_date TIMESTAMP WITH TIME ZONE,
  count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add public access policies (since we don't have authentication yet)
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for calendars" ON public.calendars FOR SELECT USING (true);
CREATE POLICY "Public insert access for calendars" ON public.calendars FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for calendars" ON public.calendars FOR UPDATE USING (true);
CREATE POLICY "Public delete access for calendars" ON public.calendars FOR DELETE USING (true);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public insert access for events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Public delete access for events" ON public.events FOR DELETE USING (true);

ALTER TABLE public.recurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for recurrences" ON public.recurrences FOR SELECT USING (true);
CREATE POLICY "Public insert access for recurrences" ON public.recurrences FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for recurrences" ON public.recurrences FOR UPDATE USING (true);
CREATE POLICY "Public delete access for recurrences" ON public.recurrences FOR DELETE USING (true);
