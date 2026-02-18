/**
 * Supabase Integration for bolt.diy
 * 
 * This module provides complete Supabase integration for:
 * - Chat history storage and retrieval
 * - Project storage and management
 * - Real-time synchronization
 * - User data export/import
 */

// Client
export { supabase, supabaseHelpers } from './client';
export type { Database } from './client';

// Service
export { SupabaseService, supabaseService } from './service';

// Hooks
export { useSupabaseChat, useSupabaseProjects } from './hooks';

// Types
export type {
  SupabaseUser,
  SupabaseProject,
  SupabaseStats,
  SupabaseApiKey,
  SupabaseCredentials,
  Database,
  Conversation,
  Message,
  Project,
} from '~/types/supabase';
