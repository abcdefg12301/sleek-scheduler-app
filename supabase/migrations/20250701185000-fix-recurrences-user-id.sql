
-- Add user_id column to recurrences table for proper authentication
ALTER TABLE public.recurrences ADD COLUMN user_id UUID REFERENCES auth.users;

-- Update existing recurrences to have a user_id (make it nullable first)
ALTER TABLE public.recurrences ALTER COLUMN user_id DROP NOT NULL;

-- Create new RLS policies for recurrences based on user authentication
DROP POLICY IF EXISTS "Allow all select and write for recurrences" ON public.recurrences;

CREATE POLICY "Users can view their own recurrences" 
  ON public.recurrences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurrences" 
  ON public.recurrences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurrences" 
  ON public.recurrences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurrences" 
  ON public.recurrences 
  FOR DELETE 
  USING (auth.uid() = user_id);
