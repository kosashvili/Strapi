-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  visitUrl TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO projects (title, description, imageUrl, visitUrl)
VALUES 
  ('Neural Canvas', 'AI-powered drawing tool that transforms sketches into digital art using machine learning algorithms.', '/placeholder.svg?height=200&width=300&text=Neural+Canvas', 'https://example.com/neural-canvas'),
  ('Quantum Todo', 'Task management app with probabilistic scheduling and uncertainty-based priority systems.', '/placeholder.svg?height=200&width=300&text=Quantum+Todo', 'https://example.com/quantum-todo'),
  ('Syntax Poetry', 'Code-to-poetry generator that converts programming syntax into readable verse and artistic expressions.', '/placeholder.svg?height=200&width=300&text=Syntax+Poetry', 'https://example.com/syntax-poetry');
