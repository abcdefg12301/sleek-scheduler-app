
-- Create calendars table
CREATE TABLE public.calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text,
  show_holidays boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  color text,
  is_holiday boolean NOT NULL DEFAULT false,
  is_segment boolean NOT NULL DEFAULT false,
  segment_type text,
  is_recurrence_instance boolean NOT NULL DEFAULT false,
  original_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create recurrences table
CREATE TABLE public.recurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  frequency text NOT NULL CHECK (frequency IN ('daily','weekly','monthly','yearly')),
  interval integer NOT NULL DEFAULT 1,
  end_date timestamp with time zone,
  count integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- (Optional) Enable Row Level Security for future user auth (but allow all now)
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select and write for calendars" ON public.calendars FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select and write for events" ON public.events FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.recurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select and write for recurrences" ON public.recurrences FOR ALL USING (true) WITH CHECK (true);
