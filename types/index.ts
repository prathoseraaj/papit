export interface User {
  id: string;
  name: string;
  color: string;
  avatar_url?: string; 
  cursor?: { from: number; to: number };
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  location: string;
  email: string;
  username: string;
  created_at?: string;
  updated_at?: string;
}