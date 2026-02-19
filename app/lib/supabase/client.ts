import type { Database } from '~/types/supabase';

// Supabase client - only loaded in browser, never during build
let supabaseClient: any = null;
let isInitialized = false;

// Get Supabase credentials
const getSupabaseCredentials = () => {
  if (typeof window === 'undefined') {
    // Server-side: return null to prevent initialization
    return { supabaseUrl: null, supabaseAnonKey: null };
  }

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

  return { supabaseUrl, supabaseAnonKey };
};

// Get or create Supabase client - ONLY runs in browser
export const getSupabase = async () => {
  // Prevent server-side execution
  if (typeof window === 'undefined') {
    console.warn('[Supabase] Cannot initialize on server');
    return null;
  }

  if (supabaseClient) return supabaseClient;
  
  if (isInitialized) {
    return supabaseClient;
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Supabase] Not configured - missing credentials');
      isInitialized = true;
      return null;
    }
    
    // Dynamic import - only executed in browser
    const createClientModule = await import('@supabase/supabase-js');
    const createClient = createClientModule.createClient;
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Supabase] Client initialized successfully');
    isInitialized = true;
    return supabaseClient;
  } catch (error) {
    console.error('[Supabase] Failed to initialize:', error);
    isInitialized = true;
    return null;
  }
};

// Helper functions - all async to support dynamic loading
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
