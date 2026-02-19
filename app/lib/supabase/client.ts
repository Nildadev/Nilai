import type { Database } from '~/types/supabase';

// Supabase client - lazy loaded to avoid build issues
let supabaseClient: any = null;

// Get Supabase credentials
const getSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    // Check localStorage first
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
    
    // Check window.env
    const browserUrl = (window as any).env?.VITE_SUPABASE_URL;
    const browserKey = (window as any).env?.VITE_SUPABASE_ANON_KEY;
    if (browserUrl && browserKey) {
      return { supabaseUrl: browserUrl, supabaseAnonKey: browserKey };
    }
  }

  // Fallback to import.meta.env (Vite injects these)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    console.log('[Supabase] Using credentials from import.meta.env');
    console.log('[Supabase] URL:', supabaseUrl);
  }

  return { supabaseUrl, supabaseAnonKey };
};

// Get or create Supabase client
export const getSupabase = async () => {
  if (supabaseClient) return supabaseClient;
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Supabase] Not configured - missing credentials');
      return null;
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Supabase] Client initialized');
    return supabaseClient;
  } catch (error) {
    console.error('[Supabase] Failed to initialize:', error);
    return null;
  }
};

// Helper functions
export const supabaseHelpers = {
  async createConversation(userId: string, title: string, metadata?: Record<string, any>) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('conversations').insert({
      user_id: userId,
      title,
      metadata: metadata || {},
    });
  },

  async getConversations(userId: string) {
    const supabase = await getSupabase();
    if (!supabase) return { data: [], error: new Error('Supabase not initialized') };
    
    return supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async getConversation(conversationId: string) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('conversations').select('*').eq('id', conversationId).single();
  },

  async updateConversation(conversationId: string, updates: Partial<{ title: string; metadata: Record<string, any> }>) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('conversations').update(updates).eq('id', conversationId);
  },

  async deleteConversation(conversationId: string) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('conversations').delete().eq('id', conversationId);
  },

  async createMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>,
  ) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('messages').insert({
      conversation_id: conversationId,
      role,
      content,
      metadata: metadata || {},
    });
  },

  async getMessages(conversationId: string) {
    const supabase = await getSupabase();
    if (!supabase) return { data: [], error: new Error('Supabase not initialized') };
    
    return supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
  },

  async updateMessage(messageId: string, updates: Partial<{ content: string; metadata: Record<string, any> }>) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('messages').update(updates).eq('id', messageId);
  },

  async deleteMessage(messageId: string) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('messages').delete().eq('id', messageId);
  },

  async createProject(userId: string, name: string, description?: string, files?: any[], metadata?: Record<string, any>) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('projects').insert({
      user_id: userId,
      name,
      description,
      files: files || [],
      metadata,
    });
  },

  async getProjects(userId: string) {
    const supabase = await getSupabase();
    if (!supabase) return { data: [], error: new Error('Supabase not initialized') };
    
    return supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async getProject(projectId: string) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('projects').select('*').eq('id', projectId).single();
  },

  async updateProject(projectId: string, updates: Partial<{ name: string; description: string; files: any[]; metadata: Record<string, any> }>) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('projects').update(updates).eq('id', projectId);
  },

  async deleteProject(projectId: string) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('projects').delete().eq('id', projectId);
  },

  async getProfile(userId: string) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('profiles').select('*').eq('id', userId).single();
  },

  async updateProfile(userId: string, updates: Partial<{ full_name: string; avatar_url: string; email: string }>) {
    const supabase = await getSupabase();
    if (!supabase) return { data: null, error: new Error('Supabase not initialized') };
    
    return supabase.from('profiles').update(updates).eq('id', userId);
  },
};

export type { Database };
