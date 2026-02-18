/**
 * Supabase Integration for Chat History
 * 
 * This file provides integration between the existing chat persistence
 * and Supabase for cloud storage.
 */

import { supabaseService } from '~/lib/supabase/service';
import type { Message } from 'ai';
import { toast } from 'react-toastify';

/**
 * Initialize Supabase chat sync
 * Call this once when the app starts
 */
export function initSupabaseChatSync() {
  // Generate or get anonymous user ID
  const userId = getOrCreateUserId();
  supabaseService.setUserId(userId);
  
  console.log('Supabase chat sync initialized for user:', userId);
}

/**
 * Get or create anonymous user ID
 * Stored in localStorage to persist across sessions
 */
function getOrCreateUserId(): string {
  const storageKey = 'bolt_anonymous_user_id';
  
  let userId = localStorage.getItem(storageKey);
  
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(storageKey, userId);
  }
  
  return userId;
}

/**
 * Generate a random user ID
 */
function generateUserId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Save messages to Supabase
 * This runs in parallel with existing IndexedDB save
 */
export async function saveMessagesToSupabase(
  conversationId: string | null,
  messages: Message[],
  title?: string,
): Promise<string | null> {
  try {
    let convId = conversationId;
    
    // Create conversation if it doesn't exist
    if (!convId) {
      const conversation = await supabaseService.createConversation(
        title || 'New Chat',
        {
          messageCount: messages.length,
          lastUpdated: new Date().toISOString(),
        },
      );
      
      if (!conversation) {
        console.warn('Failed to create Supabase conversation');
        return null;
      }
      
      convId = conversation.id;
      console.log('Created new Supabase conversation:', convId);
    }
    
    // Save all messages
    const messagesToSave = messages.filter(m => !m.annotations?.includes('no-store'));
    
    for (const message of messagesToSave) {
      await supabaseService.createMessage(
        convId,
        message.role as 'user' | 'assistant' | 'system',
        typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
        {
          messageId: message.id,
          timestamp: new Date().toISOString(),
        },
      );
    }
    
    console.log(`Saved ${messagesToSave.length} messages to Supabase conversation ${convId}`);
    return convId;
  } catch (error) {
    console.error('Failed to save messages to Supabase:', error);
    // Don't show error toast to avoid annoying user - Supabase is optional
    return null;
  }
}

/**
 * Load conversation from Supabase
 */
export async function loadConversationFromSupabase(
  conversationId: string,
): Promise<Message[] | null> {
  try {
    const messages = await supabaseService.getMessages(conversationId);
    
    if (!messages || messages.length === 0) {
      return null;
    }
    
    // Convert Supabase messages to AI SDK messages
    return messages.map(msg => ({
      id: msg.metadata?.messageId || msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: new Date(msg.created_at),
    }));
  } catch (error) {
    console.error('Failed to load conversation from Supabase:', error);
    return null;
  }
}

/**
 * Get all conversations from Supabase
 */
export async function getConversationsFromSupabase() {
  try {
    return await supabaseService.getConversations();
  } catch (error) {
    console.error('Failed to get conversations from Supabase:', error);
    return [];
  }
}

/**
 * Delete conversation from Supabase
 */
export async function deleteConversationFromSupabase(conversationId: string) {
  try {
    const success = await supabaseService.deleteConversation(conversationId);
    
    if (success) {
      toast.success('Chat deleted from cloud');
    }
    
    return success;
  } catch (error) {
    console.error('Failed to delete conversation from Supabase:', error);
    return false;
  }
}

/**
 * Check if Supabase is enabled and connected
 */
export function isSupabaseEnabled(): boolean {
  const service = supabaseService;
  return service.isServiceEnabled();
}
