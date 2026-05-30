-- Drop old tables and policies if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  age INTEGER,
  gender TEXT,
  bio TEXT,
  avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/identicon/svg?seed=default',
  banner_url TEXT DEFAULT 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Create news table
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Create profile_likes table
CREATE TABLE profile_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(target_profile_id, user_id)
);

-- Create news_likes table
CREATE TABLE news_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID REFERENCES news(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE news;
ALTER PUBLICATION supabase_realtime ADD TABLE profile_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE news_likes;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;

-- News policies
CREATE POLICY "News are viewable by everyone." ON news FOR SELECT USING (true);
CREATE POLICY "Admins can insert news." ON news FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email IN ('test@gmail.com', 'dev@gmail.com'))
);
CREATE POLICY "Admins can update news." ON news FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email IN ('test@gmail.com', 'dev@gmail.com'))
);
CREATE POLICY "Admins can delete news." ON news FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email IN ('test@gmail.com', 'dev@gmail.com'))
);

-- Profile likes policies
CREATE POLICY "Profile likes viewable by everyone." ON profile_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile likes." ON profile_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile likes." ON profile_likes FOR DELETE USING (auth.uid() = user_id);

-- News likes policies
CREATE POLICY "News likes viewable by everyone." ON news_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own news likes." ON news_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own news likes." ON news_likes FOR DELETE USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Messages policies
CREATE POLICY "Messages are viewable by everyone." ON messages FOR SELECT USING (true);
CREATE POLICY "Users can insert their own messages." ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can delete any messages." ON messages FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.email IN ('test@gmail.com', 'dev@gmail.com')
  )
);

-- Trigger for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, age, gender)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username',
    CAST(new.raw_user_meta_data->>'age' AS INTEGER),
    new.raw_user_meta_data->>'gender'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Added RPC with a new name just in case cache is stuck for the old one
CREATE OR REPLACE FUNCTION public.wipe_all_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM public.messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Setup Storage for avatars and banners
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can update their avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Banner images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Anyone can upload a banner." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Anyone can update their banner." ON storage.objects FOR UPDATE USING (bucket_id = 'banners');
