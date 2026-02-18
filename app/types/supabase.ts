export interface SupabaseUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string;
}

export interface SupabaseProject {
  id: string;
  name: string;
  organization_id: string;
  region: string;
  created_at: string;
  status: string;
}

export interface SupabaseStats {
  projects: SupabaseProject[];
  totalProjects: number;
}

export interface SupabaseApiKey {
  name: string;
  api_key: string;
}

export interface SupabaseCredentials {
  anonKey?: string;
  supabaseUrl?: string;
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          created_at?: string;
          metadata?: Record<string, any>;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          files: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          files?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          files?: any[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Conversation and Message types for the app
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface Message {
  id?: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  files: any[];
  created_at: string;
  updated_at: string;
}
