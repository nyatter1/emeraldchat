export interface Profile {
  id: string;
  username: string;
  email: string;
  age: number;
  gender: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  profiles?: Profile;
}
