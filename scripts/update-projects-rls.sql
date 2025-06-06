-- Update Row Level Security policies for authenticated users

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous read access" ON projects;
DROP POLICY IF EXISTS "Allow service role full access" ON projects;

-- Create new policies for authenticated users
CREATE POLICY "Allow public read access" 
  ON projects FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users full access" 
  ON projects 
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access" 
  ON projects 
  FOR ALL
  USING (auth.role() = 'service_role');
