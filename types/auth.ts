export interface UserMetadata {
  name: string;
  phone: string;
  address: string;
  birthdate: string;
  gender: 'male' | 'female' | 'other';
  avatar_url?: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  name: string;
  phone: string;
  address: string;
  birthdate: string;
  gender: 'male' | 'female' | 'other';
  created_at: string;
  updated_at: string;
}
