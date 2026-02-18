import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/supabase';

// Get Supabase credentials from environment or connection state
const getSupabaseCredentials = () => {
  // Try to get from localStorage first (for connected Supabase accounts)
  if (typeof window !== 'undefined') {
    const connection = localStorage.getItem('supabase_connection');
    if (connection) {
      try {
        const parsed = JSON.parse(connection);
        if (parsed.credentials?.supabaseUrl && parsed.credentials?.anonKey) {
          return {
            supabaseUrl: parsed.credentials.supabaseUrl,
            supabaseAnonKey: parsed.credentials.anonKey,
          };
        }
      } catch (e) {
        console.error('Failed to parse Supabase connection:', e);
      }
    }
  }

  // Fallback to environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

  return { supabaseUrl, supabaseAnonKey };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or connect via Settings.',
  );
}

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);

// Helper functions for common operations
export const supabaseHelpers = {
  // Conversations
  async createConversation(userId: string, title: string, metadata?: Record<string, any>) {
    return supabase.from('conversations').insert({
      user_id: userId,
      title,
      metadata: metadata || {},
    });
  },

  async getConversations(userId: string) {
    return supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async getConversation(conversationId: string) {
    return supabase.from('conversations').select('*').eq('id', conversationId).single();
  },

  async updateConversation(conversationId: string, updates: Partial<{ title: string; metadata: Record<string, any> }>) {
    return supabase.from('conversations').update(updates).eq('id', conversationId);
  },

  async deleteConversation(conversationId: string) {
    return supabase.from('conversations').delete().eq('id', conversationId);
  },

  // Messages
  async createMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>,
  ) {
    return supabase.from('messages').insert({
      conversation_id: conversationId,
      role,
      content,
      metadata: metadata || {},
    });
  },

  async getMessages(conversationId: string) {
    return supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
  },

  async updateMessage(messageId: string, updates: Partial<{ content: string; metadata: Record<string, any> }>) {
    return supabase.from('messages').update(updates).eq('id', messageId);
  },

  async deleteMessage(messageId: string) {
    return supabase.from('messages').delete().eq('id', messageId);
  },

  // Projects
  async createProject(
    userId: string,
    name: string,
    description?: string,
    files?: any[],
    metadata?: Record<string, any>,
  ) {
    return supabase.from('projects').insert({
      user_id: userId,
      name,
      description,
      files: files || [],
      metadata,
    });
  },

  async getProjects(userId: string) {
    return supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async getProject(projectId: string) {
    return supabase.from('projects').select('*').eq('id', projectId).single();
  },

  async updateProject(
    projectId: string,
    updates: Partial<{ name: string; description: string; files: any[]; metadata: Record<string, any> }>,
  ) {
    return supabase.from('projects').update(updates).eq('id', projectId);
  },

  async deleteProject(projectId: string) {
    return supabase.from('projects').delete().eq('id', projectId);
  },

  // Profile
  async getProfile(userId: string) {
    return supabase.from('profiles').select('*').eq('id', userId).single();
  },

  async updateProfile(
    userId: string,
    updates: Partial<{ full_name: string; avatar_url: string; email: string }>,
  ) {
    return supabase.from('profiles').update(updates).eq('id', userId);
  },
};

export type { Database };
