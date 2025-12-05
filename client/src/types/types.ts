// types.ts

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string;
}

// Typ för insert
export interface UserInsert {
  id?: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  bio?: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_urls?: string[];
  created_at: string;

   // Från join med users, lagras inte i posts-tabellen
  username?: string;
  full_name?: string;
  avatar_url?: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string; 
}


export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

