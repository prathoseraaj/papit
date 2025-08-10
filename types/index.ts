// User interface for collaboration features
export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { from: number; to: number };
}

// User profile interface for profile management
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