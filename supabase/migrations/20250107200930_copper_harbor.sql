/*
  # Add Storage and RLS Policies for Video Analysis

  1. Storage Policies
    - Create video-analysis bucket if it doesn't exist
    - Add policies for authenticated users to upload and read videos
  
  2. Security
    - Enable RLS on video_analysis table
    - Add policies for authenticated users to manage their videos
*/

-- Create bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name)
  VALUES ('video-analysis', 'video-analysis')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policies for video-analysis bucket
CREATE POLICY "Allow authenticated users to upload videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'video-analysis' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to read their own videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'video-analysis' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Enable RLS on video_analysis table
ALTER TABLE video_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_analysis table
CREATE POLICY "Users can insert their own video analysis"
ON video_analysis FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own video analysis"
ON video_analysis FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own video analysis"
ON video_analysis FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);