
-- Add user_id column to calendars table for proper authentication
ALTER TABLE public.calendars ADD COLUMN user_id UUID REFERENCES auth.users;

-- Update existing calendars to have a user_id (this will fail if there are existing calendars without users)
-- We'll make it nullable first, then update, then make it non-nullable
ALTER TABLE public.calendars ALTER COLUMN user_id DROP NOT NULL;

-- Create new RLS policies for calendars based on user authentication
DROP POLICY IF EXISTS "Allow all select and write for calendars" ON public.calendars;

CREATE POLICY "Users can view their own calendars" 
  ON public.calendars 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendars" 
  ON public.calendars 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendars" 
  ON public.calendars 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendars" 
  ON public.calendars 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add user_id column to events table for proper authentication
ALTER TABLE public.events ADD COLUMN user_id UUID REFERENCES auth.users;
ALTER TABLE public.events ALTER COLUMN user_id DROP NOT NULL;

-- Create new RLS policies for events based on user authentication
DROP POLICY IF EXISTS "Allow all select and write for events" ON public.events;

CREATE POLICY "Users can view their own events" 
  ON public.events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
  ON public.events 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
  ON public.events 
  FOR DELETE 
  USING (auth.uid() = user_id);
