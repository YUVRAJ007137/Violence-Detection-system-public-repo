/*
  # Disable RLS and Remove Policies
  
  1. Changes
    - Disable RLS on all tables
    - Remove storage policies
    - Remove table policies
*/

-- Disable RLS on tables
ALTER TABLE cameras DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_analysis DISABLE ROW LEVEL SECURITY;

-- Drop storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their own videos" ON storage.objects;

-- Drop table policies
DROP POLICY IF EXISTS "Users can insert their own video analysis" ON video_analysis;
DROP POLICY IF EXISTS "Users can view their own video analysis" ON video_analysis;
DROP POLICY IF EXISTS "Users can update their own video analysis" ON video_analysis;