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
  
  console.log('[Supabase Chat] Initialized for user:', userId);
  
  // Check if Supabase is enabled
  const isEnabled = supabaseService.isServiceEnabled();
  console.log('[Supabase Chat] Service enabled:', isEnabled);
  
  if (!isEnabled) {
    console.warn('[Supabase Chat] Service not enabled - check credentials');
  }
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
  console.log('[Supabase Chat] Attempting to save messages:', {
    conversationId,
    messageCount: messages.length,
    title,
  });

  try {
    let convId = conversationId;
    
    // Create conversation if it doesn't exist
    if (!convId) {
      console.log('[Supabase Chat] Creating new conversation...');
      const conversation = await supabaseService.createConversation(
        title || 'New Chat',
        {
          messageCount: messages.length,
          lastUpdated: new Date().toISOString(),
        },
      );
      
      if (!conversation) {
        console.warn('[Supabase Chat] Failed to create conversation');
        return null;
      }
      
      convId = conversation.id;
      console.log('[Supabase Chat] Created conversation:', convId);
    }
    
    // Save all messages
    const messagesToSave = messages.filter(m => !m.annotations?.includes('no-store'));
    console.log('[Supabase Chat] Saving', messagesToSave.length, 'messages to conversation', convId);
    
    let savedCount = 0;
    for (const message of messagesToSave) {
      const result = await supabaseService.createMessage(
        convId,
        message.role as 'user' | 'assistant' | 'system',
        typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
        {
          messageId: message.id,
          timestamp: new Date().toISOString(),
        },
      );
      
      if (result) {
        savedCount++;
      }
    }
    
    console.log(`[Supabase Chat] Successfully saved ${savedCount}/${messagesToSave.length} messages`);
    return convId;
  } catch (error) {
    console.error('[Supabase Chat] Failed to save messages:', error);
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
