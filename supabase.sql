-- Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
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

-- Create messages table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Create news table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Create profile_likes table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profile_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(target_profile_id, user_id)
);

-- Create news_likes table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS news_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID REFERENCES news(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

-- Create news_reactions table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS news_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID REFERENCES news(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(news_id, user_id, reaction)
);

-- Create news_comments table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS news_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID REFERENCES news(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Realtime: safely add to publication
DO '
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = ''supabase_realtime'' AND tablename = ''messages'') THEN
    EXECUTE ''ALTER PUBLICATION supabase_realtime ADD TABLE messages'';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = ''supabase_realtime'' AND tablename = ''profiles'') THEN
    EXECUTE ''ALTER PUBLICATION supabase_realtime ADD TABLE profiles'';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = ''supabase_realtime'' AND tablename = ''news'') THEN
    EXECUTE ''ALTER PUBLICATION supabase_realtime ADD TABLE news'';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = ''supabase_realtime'' AND tablename = ''profile_likes'') THEN
    EXECUTE ''ALTER PUBLICATION supabase_realtime ADD TABLE profile_likes'';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = ''supabase_realtime'' AND tablename = ''news_likes'') THEN
    EXECUTE ''ALTER PUBLICATION supabase_realtime ADD TABLE news_likes'';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = ''supabase_realtime'' AND tablename = ''news_reactions'') THEN
    EXECUTE ''ALTER PUBLICATION supabase_realtime ADD TABLE news_reactions'';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = ''supabase_realtime'' AND tablename = ''news_comments'') THEN
    EXECUTE ''ALTER PUBLICATION supabase_realtime ADD TABLE news_comments'';
  END IF;
END;
' LANGUAGE plpgsql;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;

-- News policies
DROP POLICY IF EXISTS "News are viewable by everyone." ON news;
CREATE POLICY "News are viewable by everyone." ON news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert news." ON news;
CREATE POLICY "Admins can insert news." ON news FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email IN ('test@gmail.com', 'dev@gmail.com'))
);

DROP POLICY IF EXISTS "Admins can update news." ON news;
CREATE POLICY "Admins can update news." ON news FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email IN ('test@gmail.com', 'dev@gmail.com'))
);

DROP POLICY IF EXISTS "Admins can delete news." ON news;
CREATE POLICY "Admins can delete news." ON news FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.email IN ('test@gmail.com', 'dev@gmail.com'))
);

-- Profile likes policies
DROP POLICY IF EXISTS "Profile likes viewable by everyone." ON profile_likes;
CREATE POLICY "Profile likes viewable by everyone." ON profile_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile likes." ON profile_likes;
CREATE POLICY "Users can insert their own profile likes." ON profile_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile likes." ON profile_likes;
CREATE POLICY "Users can delete their own profile likes." ON profile_likes FOR DELETE USING (auth.uid() = user_id);

-- News likes policies
DROP POLICY IF EXISTS "News likes viewable by everyone." ON news_likes;
CREATE POLICY "News likes viewable by everyone." ON news_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own news likes." ON news_likes;
CREATE POLICY "Users can insert their own news likes." ON news_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own news likes." ON news_likes;
CREATE POLICY "Users can delete their own news likes." ON news_likes FOR DELETE USING (auth.uid() = user_id);

-- News reactions policies
DROP POLICY IF EXISTS "News reactions viewable by everyone." ON news_reactions;
CREATE POLICY "News reactions viewable by everyone." ON news_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own news reactions." ON news_reactions;
CREATE POLICY "Users can insert their own news reactions." ON news_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own news reactions." ON news_reactions;
CREATE POLICY "Users can delete their own news reactions." ON news_reactions FOR DELETE USING (auth.uid() = user_id);

-- News comments policies
DROP POLICY IF EXISTS "News comments viewable by everyone." ON news_comments;
CREATE POLICY "News comments viewable by everyone." ON news_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own news comments." ON news_comments;
CREATE POLICY "Users can insert their own news comments." ON news_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own news comments." ON news_comments;
CREATE POLICY "Users can delete their own news comments." ON news_comments FOR DELETE USING (auth.uid() = user_id);

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Messages policies
DROP POLICY IF EXISTS "Messages are viewable by everyone." ON messages;
CREATE POLICY "Messages are viewable by everyone." ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own messages." ON messages;
CREATE POLICY "Users can insert their own messages." ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete any messages." ON messages;
CREATE POLICY "Admins can delete any messages." ON messages FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.email IN ('test@gmail.com', 'dev@gmail.com')
  )
);

-- Trigger for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS '
BEGIN
  INSERT INTO public.profiles (id, email, username, age, gender)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>''username'',
    CAST(new.raw_user_meta_data->>''age'' AS INTEGER),
    new.raw_user_meta_data->>''gender''
  );
  RETURN new;
END;
' LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Added RPC with a new name just in case cache is stuck for the old one
CREATE OR REPLACE FUNCTION public.wipe_all_messages()
RETURNS void AS '
BEGIN
  DELETE FROM public.messages;
END;
' LANGUAGE plpgsql SECURITY DEFINER;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Setup Storage for avatars and banners
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can update their avatar." ON storage.objects;
CREATE POLICY "Anyone can update their avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Banner images are publicly accessible." ON storage.objects;
CREATE POLICY "Banner images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Anyone can upload a banner." ON storage.objects;
CREATE POLICY "Anyone can upload a banner." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');

DROP POLICY IF EXISTS "Anyone can update their banner." ON storage.objects;
CREATE POLICY "Anyone can update their banner." ON storage.objects FOR UPDATE USING (bucket_id = 'banners');
