-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  imageUrl TEXT,
  visitUrl TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some sample data if the table is empty
INSERT INTO projects (title, description, imageUrl, visitUrl)
SELECT 
  'Neural Canvas', 
  'AI-powered drawing tool that transforms sketches into digital art using machine learning algorithms.', 
  'https://placeholder.com/200x300/neural-canvas', 
  'https://example.com/neural-canvas'
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);

INSERT INTO projects (title, description, imageUrl, visitUrl)
SELECT 
  'Quantum Todo', 
  'Task management app with probabilistic scheduling and uncertainty-based priority systems.', 
  'https://placeholder.com/200x300/quantum-todo', 
  'https://example.com/quantum-todo'
WHERE NOT EXISTS (SELECT 2 FROM projects LIMIT 1);

-- Enable RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous reads
CREATE POLICY "Allow anonymous read access" 
  ON projects FOR SELECT 
  USING (true);

-- Create a policy that allows service role to do everything
CREATE POLICY "Allow service role full access" 
  ON projects 
  USING (auth.role() = 'service_role');
