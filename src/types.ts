export interface Profile {
  id: string;
  username: string;
  email: string;
  age: number;
  gender: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  rank?: string;
  profile_music_url?: string;
  profile_music_type?: 'file' | 'youtube';
  profile_card_bg_url?: string;
  updated_at?: string;
  profile_likes?: ProfileLike[];
}

export interface ProfileLike {
  id: string;
  target_profile_id: string;
  user_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  profiles?: Profile;
}

export interface NewsLike {
  id: string;
  news_id: string;
  user_id: string;
  created_at: string;
}

export interface NewsReaction {
  id: string;
  news_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface NewsComment {
  id: string;
  news_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface News {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  profiles?: Profile;
  news_likes?: NewsLike[];
  news_reactions?: NewsReaction[];
  news_comments?: NewsComment[];
}
